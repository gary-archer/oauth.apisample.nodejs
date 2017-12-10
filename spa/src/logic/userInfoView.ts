import Authenticator from '../plumbing/authenticator';
import * as $ from 'jquery';

/*
 * Logic related to user info
 */
export default class UserInfoView {
    
    /*
     * Fields
     */
    private _authenticator: Authenticator;
    
    /*
     * Class setup
     */
    public constructor(authenticator: Authenticator) {
        this._authenticator = authenticator;
    }
    
    /*
     * Run the view
     */
    public async execute(): Promise<void> {
        
        // Hide UI elements while loading
        $('#loginNameContainer').addClass('hide');

        // Get the data we received from the id token
        let userProfile = await this._authenticator.getOpenIdConnectUserClaims();
        
        // Update the UI
        if (userProfile && userProfile.given_name && userProfile.family_name) {
            $('#loginNameContainer').removeClass('hide');
            $('#userName').text(`${userProfile.given_name} ${userProfile.family_name}`);
        }
    }
}