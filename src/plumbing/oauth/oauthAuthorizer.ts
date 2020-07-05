import {Request} from 'express';
import hasher from 'js-sha256';
import {ClaimsCache} from '../claims/claimsCache';
import {ClaimsSupplier} from '../claims/claimsSupplier';
import {CoreApiClaims} from '../claims/coreApiClaims';
import {BASETYPES} from '../dependencies/baseTypes';
import {ChildContainerHelper} from '../dependencies/childContainerHelper'
import {ErrorFactory} from '../errors/errorFactory';
import {BaseAuthorizer} from '../security/baseAuthorizer';
import {OAuthAuthenticator} from './oauthAuthenticator';

/*
 * The Express entry point for OAuth token validation and claims lookup
 */
export class OAuthAuthorizer<TClaims extends CoreApiClaims> extends BaseAuthorizer {

    /*
     * Do the OAuth processing via the middleware class
     */
    protected async execute(request: Request): Promise<CoreApiClaims> {

        // First read the access token
        const accessToken = this._readAccessToken(request);
        if (!accessToken) {
            throw ErrorFactory.createClient401Error('No access token was supplied in the bearer header');
        }

        // Get the child container for this HTTP request
        const perRequestContainer = ChildContainerHelper.resolve(request);

        // If cached results already exist for this token then return them immediately
        const accessTokenHash = hasher.sha256(accessToken);
        const cache = perRequestContainer.get<ClaimsCache<TClaims>>(BASETYPES.ClaimsCache);
        const cachedClaims = await cache.getClaimsForToken(accessTokenHash);
        if (cachedClaims) {
            return cachedClaims;
        }

        // Create new claims which we will then populate
        const claimsSupplier = perRequestContainer.get<ClaimsSupplier<TClaims>>(BASETYPES.ClaimsSupplier);
        const claims = claimsSupplier.createEmptyClaims();

        // Resolve the authenticator for this request
        const authenticator = perRequestContainer.get<OAuthAuthenticator>(BASETYPES.OAuthAuthenticator);

        // Validate the token, read token claims, and do a user info lookup
        await authenticator.validateTokenAndGetClaims(accessToken, request, claims);

        // Add custom claims from the API's own data if needed
        await claimsSupplier.createCustomClaimsProvider().addCustomClaims(accessToken, request, claims);

        // Cache the claims against the token hash until the token's expiry time
        await cache.addClaimsForToken(accessTokenHash, claims);
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
