/*
 * Token validation
 */

'use strict';
const ClaimsHandler = require('./claimsHandler');
const ClaimsCache = require('./claimsCache');
const ErrorHandler = require('./errorHandler');

/*
 * A class to handle validating tokens received by the API
 */
class TokenValidator {
    
    /*
     * Receive the request and response
     */
    constructor(request, response, oauthConfig) {
        this.request = request;
        this.response = response;
        this.oauthConfig = oauthConfig;
    }

    /*
     * Handle validating an access token and updating the claims cache
     */
    validate() {
        
        // Read the access token from the header
        let accessToken = this._readBearerToken(this.request);
        if (!accessToken) {
            return Promise.reject(ErrorHandler.getNoTokenError());
        }
        
        // Bypass validation and use cached results if they exist
        let cachedClaims = ClaimsCache.getClaimsForToken(accessToken);
        if (cachedClaims !== null) {
            this.response.locals.claims = cachedClaims;
            return Promise.resolve();
        }

        // Otherwise create a class to do claims processing for the received token
        let handler = new ClaimsHandler(this.oauthConfig, accessToken);
        return handler.lookupClaims()
            .then(data => {
            
                // Save claims to the cache until the token expiry time
                ClaimsCache.addClaimsForToken(accessToken, data.exp, data.claims);
                this.response.locals.claims = data.claims;
                return Promise.resolve();
            });
    }
    
    /*
     * Try to read the token from the authorization header
     */
    _readBearerToken() {
    
        if (this.request.headers && this.request.headers.authorization) {
            let parts = this.request.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                return parts[1];
            }
        }

        return null;
    }
}

module.exports = TokenValidator;