'use strict';

/*
 * An API controller for user operations
 */
class UserInfoApiController {

    /*
     * Receive the request and response
     */
    constructor(request, response) {
        this.request = request;
        this.response = response;
    }
    
    /*
     * Return summary data for our golfer entities
     */
    getUserClaims() {
        let serverClaims = this.response.locals.claims;
        let uiClaims = {
            given_name: serverClaims.given_name,
            family_name: serverClaims.family_name,
            email: serverClaims.email
        };

        this.response.end(JSON.stringify(uiClaims));
    }
}

module.exports = UserInfoApiController;