"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var urlHelper_1 = require("./urlHelper");
var iframeWindowHelper_1 = require("./iframeWindowHelper");
var Oidc = require("oidc-client");
var $ = require("jquery");
/*
 * Capture OIDC log output
 */
var OAuthLogger = /** @class */ (function () {
    function OAuthLogger() {
    }
    /*
     * Initialize logging and set the initial log level
     */
    OAuthLogger.initialize = function () {
        Oidc.Log.logger = OAuthLogger;
        OAuthLogger.setLevel(OAuthLogger._getUrlLogLevel());
    };
    /*
     * Set the OIDC log level and update the UI
     */
    OAuthLogger.setLevel = function (level) {
        // Set the log level in the session so that it is inherited on page reloads and by the renewal iframe
        Oidc.Log.level = level;
        sessionStorage.setItem('basicSpa.logLevel', level.toString());
        // Clear the log if setting the level on the main window
        if (!iframeWindowHelper_1.default.isIFrameOperation()) {
            OAuthLogger.clear();
        }
        // Hide or show trace details
        var traceContainer = iframeWindowHelper_1.default.getMainWindowElement('#traceContainer');
        if (level === Oidc.Log.NONE) {
            traceContainer.addClass('hide');
        }
        else {
            traceContainer.removeClass('hide');
        }
        // Hide the trace button until we have output
        var clearButton = iframeWindowHelper_1.default.getMainWindowElement('#btnTrace');
        clearButton.addClass('hide');
    };
    /*
     * Update the OIDC log level if the hash log parameter has changed
     */
    OAuthLogger.updateLevelIfRequired = function () {
        // Get old and new levels
        var oldLevel = parseInt(sessionStorage.getItem('basicSpa.logLevel'));
        var newLevel = OAuthLogger._getUrlLogLevel();
        // Update if required
        if (newLevel !== oldLevel) {
            OAuthLogger.setLevel(newLevel);
        }
    };
    /*
     * Clear trace output
     */
    OAuthLogger.clear = function () {
        // Remove output
        var traceList = iframeWindowHelper_1.default.getMainWindowElement('#trace');
        traceList.html('');
        // Hide the clear button since there is nothing to clear
        var clearButton = iframeWindowHelper_1.default.getMainWindowElement('#btnClearTrace');
        clearButton.addClass('hide');
    };
    /*
     * Uncomment to see OIDC messages
     */
    OAuthLogger.debug = function () {
        OAuthLogger._output('Oidc.Debug', arguments);
    };
    OAuthLogger.info = function () {
        OAuthLogger._output('Oidc.Info', arguments);
    };
    OAuthLogger.warn = function () {
        OAuthLogger._output('Oidc.Warn', arguments);
    };
    OAuthLogger.error = function () {
        OAuthLogger._output('Oidc.Error', arguments);
    };
    /*
     * Get the log level from the URL's hash parameter, such as #log=info
     */
    OAuthLogger._getUrlLogLevel = function () {
        // Valid values
        var validLevels = {
            'none': Oidc.Log.NONE,
            'debug': Oidc.Log.DEBUG,
            'info': Oidc.Log.INFO,
            'warn': Oidc.Log.WARN,
            'error': Oidc.Log.ERROR
        };
        // If a value like log=debug is present in the URL then return it
        var hashData = urlHelper_1.default.getLocationHashData();
        if (validLevels[hashData.log] >= Oidc.Log.NONE) {
            return validLevels[hashData.log];
        }
        // Otherwise return the stored value or default to no logging
        return parseInt(sessionStorage.getItem('basicSpa.logLevel')) | Oidc.Log.NONE;
    };
    /*
     * Handle log output
     */
    OAuthLogger._output = function (prefix, args) {
        // Get the output
        var text = Array.prototype.slice.call(args).join(' : ');
        var html = "<b>" + prefix + "</b> : " + text;
        // Make sure any trace info on the hidden iframe is routed to the main window
        var traceList = iframeWindowHelper_1.default.getMainWindowElement('#trace');
        traceList.append($('<li>').html(html));
        // Make sure the trace is visible
        var clearButton = iframeWindowHelper_1.default.getMainWindowElement('#btnClearTrace');
        if (clearButton.hasClass('hide')) {
            clearButton.removeClass('hide');
        }
    };
    return OAuthLogger;
}());
exports.default = OAuthLogger;
