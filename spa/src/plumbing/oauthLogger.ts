'use strict';
import UrlHelper from './urlHelper';
import IFrameWindowHelper from './iframeWindowHelper';
import * as Oidc from "oidc-client";
import * as $ from 'jquery';

/*
 * Capture OIDC log output
 */
export default class OAuthLogger {

    /*
     * Initialize logging and set the initial log level
     */
    public static initialize(): void {
        Oidc.Log.logger = OAuthLogger;
        OAuthLogger.setLevel(OAuthLogger._getUrlLogLevel());
    }

    /*
     * Set the OIDC log level and update the UI
     */
    public static setLevel(level: number) {

        // Set the log level in the session so that it is inherited on page reloads and by the renewal iframe
        Oidc.Log.level = level;
        sessionStorage.setItem('basicSpa.logLevel', level.toString());

        // Clear the log if setting the level on the main window
        if (!IFrameWindowHelper.isIFrameOperation()) {
            OAuthLogger.clear();
        }
        
        // Hide or show trace details
        let traceContainer = IFrameWindowHelper.getMainWindowElement('#traceContainer');
        if (level === Oidc.Log.NONE) {
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
    public static updateLevelIfRequired(): void {
        
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
    public static clear(): void {

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
    public static debug(): void {
        OAuthLogger._output('Oidc.Debug', arguments);
    }
    
    public static info(): void {
        OAuthLogger._output('Oidc.Info', arguments);
    }
    
    public static warn(): void {
        OAuthLogger._output('Oidc.Warn', arguments);
    }
    
    public static error(): void {
        OAuthLogger._output('Oidc.Error', arguments);
    }

    /*
     * Get the log level from the URL's hash parameter, such as #log=info
     */
    private static _getUrlLogLevel(): number {
       
        // Valid values
        let validLevels = {
            'none':  Oidc.Log.NONE,
            'debug': Oidc.Log.DEBUG,
            'info':  Oidc.Log.INFO,
            'warn':  Oidc.Log.WARN,
            'error': Oidc.Log.ERROR
        };

        // If a value like log=debug is present in the URL then return it
        let hashData = UrlHelper.getLocationHashData();
        if (validLevels[hashData.log] >= Oidc.Log.NONE) {
            return validLevels[hashData.log];
        }

        // Otherwise return the stored value or default to no logging
        return parseInt(sessionStorage.getItem('basicSpa.logLevel')) | Oidc.Log.NONE;
    }

    /*
     * Handle log output
     */
    private static _output(prefix, args): void {

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