import Authenticator from './authenticator';
import ClaimsCache from './claimsCache';
import ErrorHandler from './errorHandler';

/*
 * A class to manage claims processing for API requests
 */
export default class ClaimsHandler {

    /*
     * Fields
     */
    private _oauthConfig: any;
    
    /*
     * Receive configuration
     */
    public constructor(oauthConfig: any) {
        this._oauthConfig = oauthConfig;
    }

    /*
     * Handle validating an access token and updating the claims cache
     */
    public async validateTokenAndGetClaims(authorizationHeader: string | undefined): Promise<any> {
        
        // Read the access token from the header
        let accessToken = this._readBearerToken(authorizationHeader);
        if (!accessToken) {
            throw ErrorHandler.getNoTokenError();
        }

        // Bypass validation and use cached results if they exist
        let cachedClaims = ClaimsCache.getClaimsForToken(accessToken);
        if (cachedClaims !== null) {
            return cachedClaims;
        }

        // Otherwise do claims processing for the received token
        let handler = new Authenticator(this._oauthConfig, accessToken);
        let data = await handler.validateTokenAndLookupClaims();

        // Save claims to the cache until the token expiry time
        ClaimsCache.addClaimsForToken(accessToken, data.exp, data.claims);
        return data.claims;
    }
    
    /*
     * Try to read the token from the authorization header
     */
    private _readBearerToken(authorizationHeader: string | undefined): string | null {
    
        if (authorizationHeader) {
            let parts = authorizationHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                return parts[1];
            }
        }

        return null;
    }
}