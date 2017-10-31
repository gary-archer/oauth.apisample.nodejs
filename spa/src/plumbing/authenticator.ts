'use strict';
import HttpClient from './httpClient';
import ErrorHandler from './errorHandler';
import * as Oidc from "oidc-client";

/*
 * The entry point for initiating login and token requests
 */
export default class Authenticator {
    
    /*
     * Fields
     */
    userManager: any;

    /*
     * Class setup
     */
    constructor(config: any) {

        // Create OIDC settings from our application configuration
        let settings = {
            authority: config.authority,
            client_id: config.client_id,
            redirect_uri: config.app_uri,
            silent_redirect_uri: config.app_uri,
            post_logout_redirect_uri: `${config.app_uri}${config.post_logout_path}`,
            scope: config.scope,
            response_type: 'token id_token',
            loadUserInfo: true,
            automaticSilentRenew: true,
            monitorSession: false
        };
        
        // Create the user manager
        this.userManager = new Oidc.UserManager(settings);
        this.userManager.events.addSilentRenewError(this._onSilentTokenRenewalError);
        this._setupCallbacks();
    }
    
    /*
     * Clear the current access token from storage to force a login
     */
    async clearAccessToken() {

        var user = await this.userManager.getUser();
        if (user) {
            user.access_token = null;
            this.userManager.storeUser(user);
        }
    }

    /*
     * Make the current access token in storage act like it has expired
     */
    async expireAccessToken() {
        
        let user = await this.userManager.getUser();
        if (user) {

            // Set the stored value to expired and also corrupt the token so that there is a 401 if it is sent to an API
            user.expires_at = Date.now() / 1000 + 30;
            user.access_token = 'x' + user.access_token + 'x';
            
            // Update OIDC so that it silently renews the token almost immediately
            this.userManager.storeUser(user);
            this.userManager.stopSilentRenew();
            this.userManager.startSilentRenew();
        }
    }

    /*
     * Get Open Id Connect claims
     */
    async getOpenIdConnectUserClaims() {

        var user = await this.userManager.getUser();
        if (user && user.profile) {
            return user.profile;
        }

        return null;
    }

    /*
     * Get an access token and login if required
     */
    async getAccessToken() {

        // On most calls we just return the existing token from HTML5 storage
        var user = await this.userManager.getUser();
        if (user && user.access_token) {
            return user.access_token;
        }

        // Store the SPA's client side location
        let data = {
            hash: location.hash.length > 0 ? location.hash : '#'
        };
        
        try {
            // Start a login redirect
            await this.userManager.signinRedirect({state: JSON.stringify(data)});

            // Short circuit SPA page execution
            throw ErrorHandler.getNonError();
        }
        catch(e) {
            // Handle OAuth specific errors, such as those calling the metadata endpoint
            throw ErrorHandler.getFromOAuthRequest(e);
        }
    }

    /*
     * Handle the response from the authorization server
     */
    async handleLoginResponse() {
        
        // See if there is anything to do
        if (location.hash.indexOf('state') === -1) {
            return Promise.resolve();
        }

        // See if this is the main window
        if (window.top === window.self) {

            try {
                // Handle the response
                let user = await this.userManager.signinRedirectCallback();
                let data = JSON.parse(user.state);
                location.replace(location.pathname + data.hash);
            }
            catch(e) {
                // Handle OAuth response errors
                throw ErrorHandler.getFromOAuthResponse(e);
            }
        }
        else {
            // Handle silent token renewal responses and note that errors are swallowed by OIDC
            let user = await this.userManager.signinSilentCallback();

            // Short circuit SPA page execution
            throw ErrorHandler.getNonError();
        }
    }

    /*
     * Report any silent token renewal errors
     */
    _onSilentTokenRenewalError(e: any): void {

        // Login required is not a real error - we will just redirect the user to login when the API returns 401
        if (e.error !== 'login_required') {
            let error = ErrorHandler.getFromOAuthResponse(e);
            ErrorHandler.reportError(error);
        }
    }

    /*
     * Redirect in order to log out at the authorization server and remove vendor cookies
     */
    async startLogout() {
        
        try {
            await this.userManager.signoutRedirect();
        }
        catch(e) {
            ErrorHandler.reportError(ErrorHandler.getFromOAuthRequest(e));
        }
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks(): void {
        this.clearAccessToken = this.clearAccessToken.bind(this);
        this.getAccessToken = this.getAccessToken.bind(this);
        this._onSilentTokenRenewalError = this._onSilentTokenRenewalError.bind(this);
   }
}