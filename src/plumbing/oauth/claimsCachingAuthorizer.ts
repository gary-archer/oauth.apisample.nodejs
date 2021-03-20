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
import {OAuthClient} from './oauthClient';

/*
 * An authorizer that manages claims in an extensible manner, with the ability to use claims from the API's own data
 */
export class ClaimsCachingAuthorizer extends BaseAuthorizer {

    /*
     * Do the OAuth processing via the middleware class
     */
    protected async execute(
        request: Request,
        customClaimsProvider: CustomClaimsProvider,
        logEntry: LogEntryImpl): Promise<ApiClaims> {

        // First read the access token
        const accessToken = super.readAccessToken(request);
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

        // Get an OAuth client for this request
        const client = perRequestContainer.get<OAuthClient>(BASETYPES.OAuthClient);

        // Validate the token and read token claims
        const tokenData = await client.validateToken(accessToken);

        // Do the work for user info lookup
        const userInfoData = await client.getUserInfo(accessToken);

        // Ask the provider to supply claims not in the token and then create the final claims object
        const claims = await customClaimsProvider.supplyClaims(tokenData, userInfoData);

        // Cache the claims against the token hash until the token's expiry time
        await cache.addClaimsForToken(accessTokenHash, claims);

        // Finish logging here, and note that on exception the logging framework disposes the entry instead
        authorizationLogEntry.dispose();
        return claims;
    }
}
