'use strict';
import * as $ from 'jquery';

/*
 * Logic related to user info
 */
export default class UserInfoView {
    
    /*
     * Fields
     */
    private _authenticator: any;
    
    /*
     * Class setup
     */
    public constructor(authenticator) {
        this._authenticator = authenticator;
    }
    
    /*
     * Run the view
     */
    public async execute() {
        
        // Hide UI elements while loading
        $('#loginNameContainer').addClass('hide');

        // Get the data we received from the id token
        let userProfile = this._authenticator.getOpenIdConnectUserClaims()
            .then(userProfile => {

                if (userProfile.given_name && userProfile.family_name) {
                    $('#loginNameContainer').removeClass('hide');
                    $('#userName').text(`${userProfile.given_name} ${userProfile.family_name}`);
                }
            });
    }
}