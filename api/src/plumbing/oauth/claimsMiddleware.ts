import {ApiClaims} from '../../entities/apiClaims';
import {AuthorizationRulesRepository} from '../../logic/authorizationRulesRepository';
import {ApiLogger} from '../utilities/apiLogger';
import {ResponseWriter} from '../utilities/responseWriter';
import {Authenticator} from './authenticator';
import {ClaimsCache} from './claimsCache';

/*
 * The entry point for the processing to validate tokens and return claims
 * Our approach provides extensible claims to our API and enables high performance
 * It also takes close control of error responses to our SPA
 */
export class ClaimsMiddleware {

    /*
     * Fields
     */
    private _cache: ClaimsCache;
    private _authenticator: Authenticator;
    private _authorizationRulesRepository: AuthorizationRulesRepository;

    /*
     * Receive dependencies
     */
    public constructor(
        cache: ClaimsCache,
        authenticator: Authenticator,
        authorizationRulesRepository: AuthorizationRulesRepository) {

        this._cache = cache;
        this._authenticator = authenticator;
        this._authorizationRulesRepository = authorizationRulesRepository;
    }

    /*
     * Authorize a request and return true if authorization checks pass
     */
    public async authorizeRequestAndGetClaims(accessToken: string | null): Promise<ApiClaims> {

        // First handle missing tokens
        if (accessToken == null) {
            return null;
        }

        // Bypass validation and use cached results if they exist
        const cachedClaims = this._cache.getClaimsForToken(accessToken);
        if (cachedClaims !== null) {
            ApiLogger.info('Claims Middleware', 'Existing claims returned from cache');
            return cachedClaims;
        }

        // Otherwise start by introspecting the token
        const result = await this._authenticator.validateTokenAndGetTokenClaims(accessToken);

        // Handle invalid or expired tokens
        if (!result.isValid) {
            ApiLogger.info('Claims Middleware', 'Invalid or expired access token received');
            ResponseWriter.writeInvalidTokenResponse(response);
            return false;
        }

        // Next add central user info to the user's claims
        await this._authenticator.getCentralUserInfoClaims(result.claims!, accessToken);

        // Next add product user data to the user's claims
        await this._authorizationRulesRepository.setProductClaims(result.claims!, accessToken);

        // Cache the claims against the token hash until the token's expiry time
        // The next time the API is called the claims can be quickly looked up
        this._cache.addClaimsForToken(accessToken, result.expiry!, result.claims!);

        // Then move onto the API controller to execute business logic
        ApiLogger.info('Claims Middleware', 'Claims lookup completed successfully');
        return result.claims;
    }
}