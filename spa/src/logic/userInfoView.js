'use strict';
import HttpClient from 'httpClient';

/*
 * Logic related to user info
 */
export default class UserInfoView {
    
    /*
     * Construction
     */
    constructor(authenticator, baseUrl) {
        this.authenticator = authenticator;
        this.baseUrl = baseUrl;
    }
    
    /*
     * Run the view
     */
    execute() {
        
        // Hide UI elements while loading
        $('#loginNameContainer').addClass('hide');

        // Get the data
        return HttpClient.callApi(`${this.baseUrl}/userclaims/current`, 'GET', null, this.authenticator)
            .then(claims => {
                
                // Render it once received
                if(claims.given_name && claims.family_name) {
                    $('#loginNameContainer').removeClass('hide');
                    $('#userName').text(`${claims.given_name} ${claims.family_name}`);
                }
                
                return Promise.resolve();
            });
    }
}