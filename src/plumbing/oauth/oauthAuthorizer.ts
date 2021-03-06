import {Request} from 'express';
import hasher from 'js-sha256';
import {ApiClaims} from '../claims/apiClaims';
import {ClaimsCache} from '../claims/claimsCache';
import {CustomClaimsProvider} from '../claims/customClaimsProvider';
import {BASETYPES} from '../dependencies/baseTypes';
import {ChildContainerHelper} from '../dependencies/childContainerHelper';
import {ErrorFactory} from '../errors/errorFactory';
import {LogEntryImpl} from '../logging/logEntryImpl';
import {BaseAuthorizer} from '../security/baseAuthorizer';
import {OAuthAuthenticator} from './oauthAuthenticator';

/*
 * The Express entry point for OAuth token validation and claims lookup
 */
export class OAuthAuthorizer extends BaseAuthorizer {

    /*
     * Do the OAuth processing via the middleware class
     */
    protected async execute(
        request: Request,
        customClaimsProvider: CustomClaimsProvider,
        logEntry: LogEntryImpl): Promise<ApiClaims> {

        // First read the access token
        const accessToken = this._readAccessToken(request);
        if (!accessToken) {
            throw ErrorFactory.createClient401Error('No access token was supplied in the bearer header');
        }

        // Get the child container for this HTTP request
        const perRequestContainer = ChildContainerHelper.resolve(request);

        // If cached results already exist for this token then return them immediately
        const accessTokenHash = hasher.sha256(accessToken);
        const cache = perRequestContainer.get<ClaimsCache>(BASETYPES.ClaimsCache);
        const cachedClaims = await cache.getClaimsForToken(accessTokenHash);
        if (cachedClaims) {
            return cachedClaims;
        }

        // Create a child log entry for authentication related work
        // This ensures that any errors and performance in this area are reported separately to business logic
        const authorizationLogEntry = logEntry.createChild('authorizer');

        // Resolve the authenticator for this request
        const authenticator = perRequestContainer.get<OAuthAuthenticator>(BASETYPES.OAuthAuthenticator);

        // Validate the token and read token claims
        const tokenClaims = await authenticator.validateToken(accessToken);

        // Do the work for user info lookup
        const userInfoClaims = await authenticator.getUserInfo(accessToken);

        // Add custom claims from the API's own data if needed
        const customClaims = await customClaimsProvider.getCustomClaims(tokenClaims, userInfoClaims);

        // Cache the claims against the token hash until the token's expiry time
        const claims = new ApiClaims(tokenClaims, userInfoClaims, customClaims);
        await cache.addClaimsForToken(accessTokenHash, claims);

        // Finish logging here, and note that on exception the logging framework disposes the entry instead
        authorizationLogEntry.dispose();
        return claims;
    }

    /*
     * Try to read the token from the authorization header
     */
    private _readAccessToken(request: Request): string | null {

        const authorizationHeader = request.header('authorization');
        if (authorizationHeader) {
            const parts = authorizationHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                return parts[1];
            }
        }

        return null;
    }
}
