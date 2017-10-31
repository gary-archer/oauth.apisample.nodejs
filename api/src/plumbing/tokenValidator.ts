import ClaimsHandler from './claimsHandler';
import ClaimsCache from './claimsCache';
import ErrorHandler from './errorHandler';

/*
 * A class to handle validating tokens received by the API
 */
export default class TokenValidator {

    /*
     * Fields
     */
    private _request: any;
    private _response: any;
    private _oauthConfig: any;
    
    /*
     * Receive the request and response
     */
    public constructor(request, response, oauthConfig) {
        this._request = request;
        this._response = response;
        this._oauthConfig = oauthConfig;
    }

    /*
     * Handle validating an access token and updating the claims cache
     */
    public validate() {
        
        // Read the access token from the header
        let accessToken = this._readBearerToken();
        if (!accessToken) {
            return Promise.reject(ErrorHandler.getNoTokenError());
        }
        
        // Bypass validation and use cached results if they exist
        let cachedClaims = ClaimsCache.getClaimsForToken(accessToken);
        if (cachedClaims !== null) {
            this._response.locals.claims = cachedClaims;
            return Promise.resolve();
        }

        // Otherwise create a class to do claims processing for the received token
        let handler = new ClaimsHandler(this._oauthConfig, accessToken);
        return handler.lookupClaims()
            .then(data => {
            
                // Save claims to the cache until the token expiry time
                ClaimsCache.addClaimsForToken(accessToken, data.exp, data.claims);
                this._response.locals.claims = data.claims;
                return Promise.resolve();
            });
    }
    
    /*
     * Try to read the token from the authorization header
     */
    private _readBearerToken(): string {
    
        if (this._request.headers && this._request.headers.authorization) {
            let parts = this._request.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                return parts[1];
            }
        }

        return null;
    }
}