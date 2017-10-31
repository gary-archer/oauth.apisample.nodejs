'use strict';
import * as $ from 'jquery';

/*
 * Logic related to user info
 */
export default class UserInfoView {
    
    /*
     * Fields
     */
    authenticator: any;
    
    /*
     * Class setup
     */
    constructor(authenticator) {
        this.authenticator = authenticator;
    }
    
    /*
     * Run the view
     */
    execute(): any {
        
        // Hide UI elements while loading
        $('#loginNameContainer').addClass('hide');

        // Get the data we received from the id token
        let userProfile = this.authenticator.getOpenIdConnectUserClaims()
            .then(userProfile => {

                if (userProfile.given_name && userProfile.family_name) {
                    $('#loginNameContainer').removeClass('hide');
                    $('#userName').text(`${userProfile.given_name} ${userProfile.family_name}`);
                }
            });
    }
}