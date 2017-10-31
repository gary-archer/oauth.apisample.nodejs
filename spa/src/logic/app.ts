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
    appConfig: any;
    authenticator: any;
    router: any;
    
    /*
     * Class setup
     */
    constructor() {
        // Create members
        this.appConfig = null;
        this.authenticator = Authenticator;
        this.router = Router;
        
        // Initialize Javascript
        (<any>window).$ = $;
        this._setupCallbacks();
    }
    
    /*
     * The entry point for the SPA
     */
    execute(): void {
        
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
        this._getAppConfig()
            .then(this._configureAuthentication)
            .then(this._handleLoginResponse)
            .then(this._getUserClaims)
            .then(this._runPage)
            .catch(e => { ErrorHandler.reportError(e); });
    }
    
    /*
     * Download application configuration
     */
    _getAppConfig(): any  {
        return HttpClient.loadAppConfiguration('app.config.json')
        .then(config => {
            this.appConfig = config;
            return Promise.resolve();
        });
    }
    
    /*
     * Point OIDC logging to our application logger and then supply OAuth settings
     */
    _configureAuthentication(): void {
        this.authenticator = new Authenticator(this.appConfig.oauth);
        OAuthLogger.initialize();
        this.router = new Router(this.appConfig, this.authenticator);
    }
    
    /*
     * Handle login responses on page load so that we have tokens and can call APIs
     */
    _handleLoginResponse(): any {
        return this.authenticator.handleLoginResponse();
    }
    
    /*
     * Download user claims from the API, which can contain any data we like
     */
    _getUserClaims() {
        return this.router.executeUserInfoView();
    }

    /*
     * Once login startup login processing has completed, start listening for hash changes
     */
    _runPage(): void {
        $(window).on('hashchange', this._onHashChange);
        return this.router.executeView();
    }
            
    /*
     * Change the view based on the hash URL and catch errors
     */
    _onHashChange(): void {
        OAuthLogger.updateLevelIfRequired();
        this.router.executeView()
            .catch(e => { ErrorHandler.reportError(e); });
    }
    
    /*
     * Button handler to reset the hash location to the list view and refresh
     */
    _onHome(): void {
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
    _onRefreshData(): void {
        this.router.executeView()
            .catch(e => { ErrorHandler.reportError(e); });
    }
    
    /*
     * Force a new access token to be retrieved
     */
    _onExpireToken(): void {
        this.authenticator.expireAccessToken();
    }

    /*
     * Start a logout request
     */
    _onLogout(): void {
        this.authenticator.startLogout();
    }

    /*
     * Clear error output
     */
    _onClearError(): void {
        ErrorHandler.clear();
    }

    /*
     * Clear trace output
     */
    _onClearTrace(): void {
        OAuthLogger.clear();
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks(): void {
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