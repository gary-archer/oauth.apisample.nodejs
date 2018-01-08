import * as $ from 'jquery';

/*
 * Logic related to the logout view
 */
export default class LogoutView {
    
    /*
     * Run the view
     */
    public async execute(): Promise<void> {
        
        // Show logout details
        $('#loggedOut').removeClass('hide');

        // Disable buttons until we are logged in again
        $('.initiallydisabled').prop('disabled', true);
        $('.initiallydisabled').addClass('disabled');
    }

    /*
     * Hide UI elements when the view unloads
     */
    public unload(): void {
        $('#loggedOut').addClass('hide');
    }
}