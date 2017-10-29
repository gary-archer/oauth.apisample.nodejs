'use strict';
import HttpClient from 'httpClient';
import ErrorHandler from 'errorHandler';
import {UserManager as OidcUserManager} from 'oidc-client';

/*
 * The entry point for initiating login and token requests
 */
export default class Authenticator {
    
    /*
     * Class setup
     */
    constructor(config) {
        
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
        
        // Create the OIDC class
        this.userManager = new OidcUserManager(settings);
        this.userManager.events.addSilentRenewError(this._onSilentTokenRenewalError);
        this._setupCallbacks();
    }
    
    /*
     * Clear the current access token from storage to force a login
     */
    clearAccessToken() {

        return this.userManager.getUser()
            .then(user => {

                if (!user) {
                    return Promise.resolve(); 
                }

                user.access_token = null;
                this.userManager.storeUser(user);
            });
    }

    /*
     * Make the current access token in storage act like it has expired
     */
    expireAccessToken() {
        
        return this.userManager.getUser()
            .then(user => {

                if (!user) {
                    return Promise.resolve(); 
                }

                // Set the stored value to expired and also corrupt the token so that there is a 401 if it is sent to an API
                user.expires_at = parseInt(Date.now() / 1000) + 30;
                user.access_token = 'x' + user.access_token + 'x';
                
                // Update OIDC so that it silently renews the token almost immediately
                this.userManager.storeUser(user);
                this.userManager.stopSilentRenew();
                this.userManager.startSilentRenew();
            });
    }

    /*
     * Get Open Id Connect claims
     */
    getOpenIdConnectUserClaims() {

        return this.userManager.getUser()
            .then(user => {

                if (user && user.profile) {
                    return user.profile;
                }

                return null;
            });
    }

    /*
     * Get an access token and login if required
     */
    getAccessToken() {

        return this.userManager.getUser()
            .then(user => {

                // On most calls we just return the existing token from HTML5 storage
                if (user && user.access_token) {
                    return user.access_token;
                }

                // Store the SPA's client side location
                let data = {
                    hash: location.hash.length > 0 ? location.hash : '#'
                };

                // Start a login redirect
                return this.userManager.signinRedirect({state: JSON.stringify(data)})
                    .then(() => {

                        // Short circuit SPA page execution
                        return Promise.reject(ErrorHandler.getNonError());
                    })
                    .catch(e => {
                        
                        // Handle OAuth specific errors here, such as those calling the metadata endpoint
                        return Promise.reject(ErrorHandler.getFromOAuthRequest(e));
                    });
                });
    }

    /*
     * Handle the response from the authorization server
     */
    handleLoginResponse() {
        
        // See if there is anything to do
        if (location.hash.indexOf('state') === -1) {
            return Promise.resolve();
        }

        // See if this is the main window
        if (window.top === window.self) {

            // Handle login responses
            return this.userManager.signinRedirectCallback()
                .then(user => {

                    // Restore the SPA's client side location
                    let data = JSON.parse(user.state);
                    location.replace(location.pathname + data.hash);
                    return Promise.resolve();
                })
                .catch(e => {

                    // Handle OAuth specific errors here
                    return Promise.reject(ErrorHandler.getFromOAuthResponse(e));
                });
        }
        else {

            // Handle silent token renewal responses and note that errors are swallowed by OIDC
            return this.userManager.signinSilentCallback()
                .then(user => {

                    // Avoid rendering the whole page on the hidden iframe by short circuiting execution
                    return Promise.reject(ErrorHandler.getNonError());
                });
        }
    }

    /*
     * Report any silent token renewal errors
     */
    _onSilentTokenRenewalError(e) {

        // Login required is not a real error - we will just redirect the user on the next API 401 call
        if (e.error !== 'login_required') {
            let error = ErrorHandler.getFromOAuthResponse(e);
            ErrorHandler.reportError(error);
        }
    }

    /*
     * Start logout processing to remove tokens and vendor cookies
     */
    startLogout() {
        
        // Redirect in order to log out at the authorization server and remove vendor cookies
        this.userManager.signoutRedirect()
            .then(request => {
               return Promise.resolve();
            })
            .catch(e => {
                ErrorHandler.reportError(ErrorHandler.getFromOAuthRequest(e));
                return Promise.resolve();
            });
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    _setupCallbacks() {
        this.clearAccessToken = this.clearAccessToken.bind(this);
        this.getAccessToken = this.getAccessToken.bind(this);
        this._onSilentTokenRenewalError = this._onSilentTokenRenewalError.bind(this);
   }
}