'use strict';
import Authenticator from '../plumbing/authenticator';
import HttpClient from '../plumbing/httpClient';
import OAuthLogger from '../plumbing/oauthLogger';
import ErrorHandler from '../plumbing/errorHandler';
import Router from './router';
import * as $ from 'jquery';

/*
 * The application class
 */
class App {
    
    /*
     * Fields
     */
    private _appConfig: any;
    private _authenticator: any;
    private _router: any;
    
    /*
     * Class setup
     */
    public constructor() {
        
        // Initialize Javascript
        (<any>window).$ = $;
        this._setupCallbacks();
    }
    
    /*
     * The entry point for the SPA
     */
    public async execute() {

        // Set up click handlers
        $('#btnHome').click(this._onHome);
        $('#btnRefreshData').click(this._onRefreshData);
        $('#btnExpireAccessToken').click(this._onExpireToken);
        $('#btnLogout').click(this._onLogout);
        $('#btnClearError').click(this._onClearError);
        $('#btnClearTrace').click(this._onClearTrace);

        // Disable buttons until ready
        $('.initiallyDisabled').prop('disabled', true);
        
        // Download configuration, then handle login, then handle login responses
        try {
            await this._getAppConfig();
            await this._configureAuthentication();
            await this._handleLoginResponse();
            await this._getUserClaims();
            await this._runPage();
        }
        catch(e) {
            ErrorHandler.reportError(e);
        }
    }
    
    /*
     * Download application configuration
     */
    private async _getAppConfig() {
        this._appConfig = await HttpClient.loadAppConfiguration('app.config.json');
    }
    
    /*
     * Point OIDC logging to our application logger and then supply OAuth settings
     */
    private _configureAuthentication(): void {
        this._authenticator = new Authenticator(this._appConfig.oauth);
        OAuthLogger.initialize();
        this._router = new Router(this._appConfig, this._authenticator);
    }
    
    /*
     * Handle login responses on page load so that we have tokens and can call APIs
     */
    private async _handleLoginResponse() {
        await this._authenticator.handleLoginResponse();
    }
    
    /*
     * Download user claims from the API, which can contain any data we like
     */
    private async _getUserClaims() {
        await this._router.executeUserInfoView();
    }

    /*
     * Once login startup login processing has completed, start listening for hash changes
     */
    private async _runPage() {
        $(window).on('hashchange', this._onHashChange);
        await this._router.executeView();
    }
            
    /*
     * Change the view based on the hash URL and catch errors
     */
    private async _onHashChange() {
        OAuthLogger.updateLevelIfRequired();
        
        try {
            await this._router.executeView();
        }
        catch(e) {
            ErrorHandler.reportError(e);
        }
    }
    
    /*
     * Button handler to reset the hash location to the list view and refresh
     */
    private _onHome(): void {
        if (location.hash === '#' || location.hash.length === 0) {
            this._onHashChange();    
        }
        else {
            location.hash = '#';
        }
    }
    
    /*
     * Force a page reload
     */
    private async _onRefreshData() {
        try {
            await this._router.executeView();
        }
        catch(e) {
            ErrorHandler.reportError(e);
        }
    }
    
    /*
     * Force a new access token to be retrieved
     */
    private async _onExpireToken() {
        await this._authenticator.expireAccessToken();
    }

    /*
     * Start a logout request
     */
    private async _onLogout() {
        await this._authenticator.startLogout();
    }

    /*
     * Clear error output
     */
    private _onClearError(): void {
        ErrorHandler.clear();
    }

    /*
     * Clear trace output
     */
    private _onClearTrace(): void {
        OAuthLogger.clear();
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._configureAuthentication = this._configureAuthentication.bind(this);
        this._handleLoginResponse = this._handleLoginResponse.bind(this);
        this._getUserClaims = this._getUserClaims.bind(this);
        this._runPage = this._runPage.bind(this);
        this._onHashChange = this._onHashChange.bind(this);
        this._onHome = this._onHome.bind(this);
        this._onRefreshData = this._onRefreshData.bind(this);
        this._onExpireToken = this._onExpireToken.bind(this);
        this._onLogout = this._onLogout.bind(this);
   }
}

/*
 * Start the application
 */
let app = new App();
app.execute();