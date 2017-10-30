'use strict';
import UrlHelper from 'urlHelper';
import IFrameWindowHelper from 'iframeWindowHelper';
import {Log as OidcLog} from 'oidc-client';
import $ from 'jquery';

/*
 * Capture OIDC log output
 */
export default class OAuthLogger {

    /*
     * Initialize logging and set the initial log level
     */
    static initialize() {
        OidcLog.logger = OAuthLogger;
        OAuthLogger.setLevel(OAuthLogger._getUrlLogLevel());
    }

    /*
     * Set the OIDC log level and update the UI
     */
    static setLevel(level) {

        // Set the log level in the session so that it is inherited on page reloads and by the renewal iframe
        OidcLog.level = level;
        sessionStorage.setItem('basicSpa.logLevel', level);

        // Clear the log if setting the level on the main window
        if (!IFrameWindowHelper.isIFrameOperation()) {
            OAuthLogger.clear();
        }
        
        // Hide or show trace details
        let traceContainer = IFrameWindowHelper.getMainWindowElement('#traceContainer');
        if (level === OidcLog.NONE) {
            traceContainer.addClass('hide');
        }
        else {
            traceContainer.removeClass('hide');
        }

        // Hide the trace button until we have output
        let clearButton = IFrameWindowHelper.getMainWindowElement('#btnTrace');
        clearButton.addClass('hide');
    }

    /*
     * Update the OIDC log level if the hash log parameter has changed
     */
    static updateLevelIfRequired() {
        
        // Get old and new levels
        let oldLevel = parseInt(sessionStorage.getItem('basicSpa.logLevel'));
        let newLevel = OAuthLogger._getUrlLogLevel();

        // Update if required
        if (newLevel !== oldLevel) {
            OAuthLogger.setLevel(newLevel);
        }
    }

    /*
     * Clear trace output
     */
    static clear() {

        // Remove output
        let traceList = IFrameWindowHelper.getMainWindowElement('#trace');
        traceList.html('');

        // Hide the clear button since there is nothing to clear
        let clearButton = IFrameWindowHelper.getMainWindowElement('#btnClearTrace');
        clearButton.addClass('hide');
    }
    
    /*
     * Uncomment to see OIDC messages
     */
    static debug() {
        OAuthLogger._output('Oidc.Debug', arguments);
    }
    
    static info() {
        OAuthLogger._output('Oidc.Info', arguments);
    }
    
    static warn() {
        OAuthLogger._output('Oidc.Warn', arguments);
    }
    
    static error() {
        OAuthLogger._output('Oidc.Error', arguments);
    }

    /*
     * Get the log level from the URL's hash parameter, such as #log=info
     */
    static _getUrlLogLevel() {
        
        // Valid values
        let validLevels = {
            'none':  OidcLog.NONE,
            'debug': OidcLog.DEBUG,
            'info':  OidcLog.INFO,
            'warn':  OidcLog.WARN,
            'error': OidcLog.ERROR
        };

        // If a value like log=debug is present in the URL then return it
        let hashData = UrlHelper.getLocationHashData();
        if (validLevels[hashData.log] >= OidcLog.NONE) {
            return validLevels[hashData.log];
        }

        // Otherwise return the stored value or default to no logging
        return parseInt(sessionStorage.getItem('basicSpa.logLevel')) | OidcLog.None;
    }

    /*
     * Handle log output
     */
    static _output(prefix, args) {

        // Get the output
        let text = Array.prototype.slice.call(args).join(' : ');
        let html = `<b>${prefix}</b> : ${text}`;
        
        // Make sure any trace info on the hidden iframe is routed to the main window
        let traceList = IFrameWindowHelper.getMainWindowElement('#trace');
        traceList.append($('<li>').html(html));

        // Make sure the trace is visible
        let clearButton = IFrameWindowHelper.getMainWindowElement('#btnClearTrace');
        if (clearButton.hasClass('hide')) {
            clearButton.removeClass('hide');
        }
    }
}