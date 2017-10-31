'use strict';
import * as $ from 'jquery';

/*
 * Logic related to the logout view
 */
export default class LogoutView {
    
    /*
     * Run the view
     */
    async execute() {
        $('#loggedOut').removeClass('hide');
    }

    /*
     * Hide UI elements when the view unloads
     */
    unload(): void {
        $('#loggedOut').addClass('hide');
    }
}