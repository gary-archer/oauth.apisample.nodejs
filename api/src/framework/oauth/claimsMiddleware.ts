import {ApiLogger} from '../utilities/apiLogger';
import {Authenticator} from './authenticator';
import {ClaimsCache} from './claimsCache';
import {CoreApiClaims} from './coreApiClaims';
import {CustomClaimsProvider} from './customClaimsProvider';

/*
 * The entry point for the processing to validate tokens and return claims
 * Our approach provides extensible claims to our API and enables high performance
 * It also takes close control of error responses to our SPA
 */
export class ClaimsMiddleware<TClaims extends CoreApiClaims> {

    /*
     * Injected dependencies
     */
    private _cache: ClaimsCache<TClaims>;
    private _authenticator: Authenticator;
    private _customClaimsProvider: CustomClaimsProvider;

    /*
     * Receive dependencies
     */
    public constructor(
        cache: ClaimsCache<TClaims>,
        authenticator: Authenticator,
        customClaimsProvider: CustomClaimsProvider) {

        this._cache = cache;
        this._authenticator = authenticator;
        this._customClaimsProvider = customClaimsProvider;
    }

    /*
     * Authorize a request and return claims on success
     * A null response indicates invalid or expired tokens which will result in a 401
     * An error response is also possiblem, which will result in a 500
     */
    public async authorizeRequestAndSetClaims(accessToken: string | null, claims: CoreApiClaims): Promise<boolean> {

        // First handle missing tokens
        if (accessToken == null) {
            return false;
        }

        // Bypass and use cached results if they exist
        const cacheSuccess = await this._cache.getClaimsForToken(accessToken, claims);
        if (cacheSuccess) {
            ApiLogger.info('Claims Middleware', 'Existing claims returned from cache');
            return true;
        }

        // Introspect the token and set token claims, and a failed result indicates no valid token
        const [tokenSuccess, expiry] = await this._authenticator.validateTokenAndSetClaims(accessToken, claims);
        if (!tokenSuccess) {
            ApiLogger.info('Claims Middleware', 'Invalid or expired access token received');
            return false;
        }

        // Next add central user info claims, and expiry is a race condition possibility here also
        const userInfoSuccess = await this._authenticator.setCentralUserInfoClaims(accessToken, claims);
        if (!userInfoSuccess) {
            ApiLogger.info('Claims Middleware', 'Expired access token used for user info lookup');
            return false;
        }

        // Add any custom product specific custom claims
        await this._customClaimsProvider.addCustomClaims(accessToken, claims);

        // Cache the claims against the token hash until the token's expiry time
        // The next time the API is called, all of the above results can be quickly looked up
        await this._cache.addClaimsForToken(accessToken, expiry, claims);
        ApiLogger.info('Claims Middleware', 'Claims lookup for new token completed successfully');
        return true;
    }
}
