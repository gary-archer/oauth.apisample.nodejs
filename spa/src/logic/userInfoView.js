'use strict';
import HttpClient from 'httpClient';

/*
 * Logic related to user info
 */
export default class UserInfoView {
    
    /*
     * Construction
     */
    constructor(authenticator) {
        this.authenticator = authenticator;
    }
    
    /*
     * Run the view
     */
    execute() {
        
        // Hide UI elements while loading
        $('#loginNameContainer').addClass('hide');

        // Get the data we received from the id token
        let userProfile = this.authenticator.getOpenIdConnectUserClaims()
            .then(userProfile => {

                /*for(var x in userProfile) {
                    alert(`key: ${x}, Value: ${userProfile[x]}`);
                }*/

                if(userProfile.given_name && userProfile.family_name) {
                    $('#loginNameContainer').removeClass('hide');
                    $('#userName').text(`${userProfile.given_name} ${userProfile.family_name}`);
                }
            });
    }
}