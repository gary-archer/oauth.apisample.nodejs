import * as $ from 'jquery';

/*
 * Logic related to the logout view
 */
export default class LogoutView {
    
    /*
     * Run the view
     */
    public async execute() {
        $('#loggedOut').removeClass('hide');
    }

    /*
     * Hide UI elements when the view unloads
     */
    public unload(): void {
        $('#loggedOut').addClass('hide');
    }
}