import Authenticator from '../plumbing/authenticator';
import ListView from './listView';
import TransactionsView from './transactionsView';
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
    private _apiBaseUrl: string;
    private _authenticator: Authenticator;
    private _currentView: any;
    
    /*
     * Initialize the current view
     */
    public constructor(apiBaseUrl: string, authenticator: Authenticator) {
        this._apiBaseUrl = apiBaseUrl;
        this._authenticator = authenticator;
    }
    
    /*
     * Execute a view based on the hash URL data
     */
    public async executeView(): Promise<void> {

        // Disable buttons until ready
        $('.initiallydisabled').prop('disabled', true);
        $('.initiallydisabled').addClass('disabled');

        // Get URL details
        let oldView = this._currentView;
        let hashData = UrlHelper.getLocationHashData();

        // Work out which view to show
        if (hashData.loggedout) {
            this._currentView = new LogoutView();
        }
        else {
            if (hashData.contract_address) {
                this._currentView = new TransactionsView(this._authenticator, this._apiBaseUrl, hashData.contract_address);
            }
            else {
                this._currentView = new ListView(this._authenticator, this._apiBaseUrl);
            }
        }

        // Update common elements of the frame window when running a new view
        $('#error').text('');
        
        // Unload the old view
        if (oldView) {
            oldView.unload();
        }

        // Run the new view
        await this._currentView.execute();

        // Enable buttons unless logged out
        if (!hashData.loggedout) {
            $('.initiallydisabled').prop('disabled', false);
            $('.initiallydisabled').removeClass('disabled');
        }
    }

    /*
     * Show the user info child view unless we are logged out
     */
    public async executeUserInfoView() : Promise<void> {

        let hashData = UrlHelper.getLocationHashData();
        if (!hashData.loggedout) {
            let view = new UserInfoView(this._authenticator);
            await view.execute();
        }
    }
}