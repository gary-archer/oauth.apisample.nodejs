'use strict';
import $ from 'jquery';

/*
 * Logic related to the logout view
 */
export default class LogoutView {
    
    /*
     * Run the view
     */
    execute() {
        $('#loggedOut').removeClass('hide');
        return Promise.resolve();
    }

    /*
     * Hide UI elements when the view unloads
     */
    unload() {
        $('#loggedOut').addClass('hide');
    }
}