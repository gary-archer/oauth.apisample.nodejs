
'use strict';
import ListView from './listView';
import DetailsView from './detailsView';
import LogoutView from './logoutView';
import UserInfoView from './userInfoView';
import UrlHelper from '../plumbing/urlHelper';
import OAuthLogger from '../plumbing/oauthLogger';
import * as $ from 'jquery';

/*
 * A very primitive router to deal with switching views
 */
export default class Router {

    /*
     * Fields
     */
    appConfig: any;
    authenticator: any;
    currentView: any;
    
    /*
     * Initialize the current view
     */
    constructor(appConfig, authenticator) {
        this.appConfig = appConfig;
        this.authenticator = authenticator;
        this.currentView = null;
    }
    
    /*
     * Execute a view based on the hash URL data
     */
    async executeView() {
        
        // Get URL details
        let oldView = this.currentView;
        let hashData = UrlHelper.getLocationHashData();

        // Work out which view to show
        if (hashData.loggedout) {
            this.currentView = new LogoutView();
        }
        else {
            if (hashData.golfer) {
                this.currentView = new DetailsView(this.authenticator, this.appConfig.app.dataUrl, hashData.golfer);
            }
            else {
                this.currentView = new ListView(this.authenticator, this.appConfig.app.dataUrl);
            }
        }

        // Update common elements of the frame window when running a new view
        $('#error').text('');
        $('.initiallyDisabled').prop('disabled', true);
        $('.initiallyDisabled').addClass('disabled');
        
        // Unload the old view
        if (oldView) {
            oldView.unload();
        }

        // Run the new view
        return await this.currentView.execute();
    }

    /*
     * Show the user info child view unless we are logged out
     */
    async executeUserInfoView() {

        let hashData = UrlHelper.getLocationHashData();
        if (!hashData.loggedout) {
            let view = new UserInfoView(this.authenticator);
            await view.execute();
        }
    }
}