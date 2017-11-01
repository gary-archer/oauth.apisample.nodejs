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
    private _apiBaseUrl: any;
    private _authenticator: any;
    private _currentView: any;
    
    /*
     * Initialize the current view
     */
    public constructor(apiBaseUrl, authenticator) {
        this._apiBaseUrl = apiBaseUrl;
        this._authenticator = authenticator;
    }
    
    /*
     * Execute a view based on the hash URL data
     */
    public async executeView() {

        alert('execute view');
        
        // Get URL details
        let oldView = this._currentView;
        let hashData = UrlHelper.getLocationHashData();

        // Work out which view to show
        if (hashData.loggedout) {
            this._currentView = new LogoutView();
        }
        else {
            if (hashData.golfer) {
                this._currentView = new DetailsView(this._authenticator, this._apiBaseUrl, hashData.golfer);
            }
            else {
                this._currentView = new ListView(this._authenticator, this._apiBaseUrl);
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
        return await this._currentView.execute();
    }

    /*
     * Show the user info child view unless we are logged out
     */
    public async executeUserInfoView() {

        let hashData = UrlHelper.getLocationHashData();
        if (!hashData.loggedout) {
            let view = new UserInfoView(this._authenticator);
            await view.execute();
        }
    }
}