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
        let claims = this.response.locals.claims;
        this.response.end(JSON.stringify(claims));
    }
}

module.exports = UserInfoApiController;