import {ApiLogger} from '../utilities/apiLogger';
import {ClaimsFactory} from '../utilities/claimsFactory';
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
    private _claimsFactory: ClaimsFactory<TClaims>;

    /*
     * Receive dependencies
     */
    public constructor(
        cache: ClaimsCache<TClaims>,
        authenticator: Authenticator,
        claimsFactory: ClaimsFactory<TClaims>) {

        this._cache = cache;
        this._authenticator = authenticator;
        this._claimsFactory = claimsFactory;
    }

    /*
     * Authorize a request and return claims on success
     * A null response indicates invalid or expired tokens which will result in a 401
     * An error response is also possiblem, which will result in a 500
     */
    public async authorizeRequestAndGetClaims(accessToken: string | null): Promise<TClaims | null> {

        // First handle missing tokens
        if (!accessToken) {
            return null;
        }

        // Bypass and use cached results if they exist
        const cachedClaims = await this._cache.getClaimsForToken(accessToken);
        if (cachedClaims) {
            ApiLogger.info('Claims Middleware', 'Existing claims returned from cache');
            return cachedClaims;
        }

        // Otherwise create new claims which we will populate
        const claims = this._claimsFactory.createEmptyClaims();

        // Introspect the token and set token claims, and a failed result indicates no valid token
        const [tokenSuccess, expiry] = await this._authenticator.validateTokenAndSetClaims(accessToken, claims);
        if (!tokenSuccess) {
            ApiLogger.info('Claims Middleware', 'Invalid or expired access token received');
            return null;
        }

        // Next add central user info claims, and expiry is a race condition possibility here also
        const userInfoSuccess = await this._authenticator.setCentralUserInfoClaims(accessToken, claims);
        if (!userInfoSuccess) {
            ApiLogger.info('Claims Middleware', 'Expired access token used for user info lookup');
            return null;
        }

        // Add any custom product specific custom claims
        const customClaimsProvider = this._claimsFactory.createCustomClaimsProvider();
        await customClaimsProvider.addCustomClaims(accessToken, claims);

        // Cache the claims against the token hash until the token's expiry time
        // The next time the API is called, all of the above results can be quickly looked up
        await this._cache.addClaimsForToken(accessToken, expiry, claims);
        ApiLogger.info('Claims Middleware', 'Claims lookup for new token completed successfully');
        return claims;
    }
}
