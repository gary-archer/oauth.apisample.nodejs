"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uiError_1 = require("./uiError");
var iframeWindowHelper_1 = require("./iframeWindowHelper");
var $ = require("jquery");
/*
 * A class to handle composing and reporting errors
 */
var ErrorHandler = /** @class */ (function () {
    function ErrorHandler() {
    }
    /*
     * Output fields from an AppError object, depending on what is populated
     */
    ErrorHandler.reportError = function (exception) {
        // Ensure that the error is of type UIError
        var error = ErrorHandler.getFromException(exception);
        // Only report real errors
        if (error.nonError === true) {
            return;
        }
        // Make sure the hidden iframe outputs error details to the main window
        var errorContainer = iframeWindowHelper_1.default.getMainWindowElement('#error');
        errorContainer.text('');
        if (error.message.length > 0) {
            errorContainer.append($('<li>').html("<b>Message</b> : " + error.message));
        }
        if (error.statusCode > -1) {
            errorContainer.append($('<li>').html("<b>Status Code</b> : " + error.statusCode));
        }
        if (error.area.length > 0) {
            errorContainer.append($('<li>').html("<b>Area</b> : " + error.area));
        }
        if (error.url.length > 0) {
            errorContainer.append($('<li>').html("<b>URL</b> : " + error.url));
        }
        if (error.details.length > 0) {
            errorContainer.append($('<li>').html("<b>Details</b> : " + error.details));
        }
        errorContainer.append($('<li>').html("<b>UTC Time</b> : " + new Date().toUTCString()));
        // Show the clear button
        var clearButton = iframeWindowHelper_1.default.getMainWindowElement('#btnClearError');
        if (clearButton.hasClass('hide')) {
            clearButton.removeClass('hide');
        }
    };
    /*
     * Clear trace output
     */
    ErrorHandler.clear = function () {
        // Remove output
        var errorList = iframeWindowHelper_1.default.getMainWindowElement('#error');
        errorList.html('');
        // Hide the clear button since
        var clearButton = iframeWindowHelper_1.default.getMainWindowElement('#btnClearError');
        clearButton.addClass('hide');
    };
    /*
     * A non error is used to short circuit execution without displaying an error
     */
    ErrorHandler.getNonError = function () {
        return new uiError_1.default({
            nonError: true
        });
    };
    /*
     * Sign in request errors most commonly
     */
    ErrorHandler.getFromOAuthRequest = function (e) {
        // Already handled errors
        if (e instanceof uiError_1.default) {
            return e;
        }
        // OIDC request errors are usually caused calling the Authorization Server and are returned as exceptions
        var error = ErrorHandler.getFromException(e);
        // Update fields and use a status of zero to hint that it may be a CORS error
        error.message = "Authentication request error : " + error.message;
        error.area = 'OAuth';
        error.statusCode = 0;
        error.details = 'Error calling Authorization Server';
        return error;
    };
    /*
     * Sign in request errors most commonly
     */
    ErrorHandler.getFromOAuthResponse = function (e) {
        // Already handled errors
        if (e instanceof uiError_1.default) {
            return e;
        }
        // Handle OAuth errors
        var messagePrefix = 'Authentication response error';
        if (e.error && e.error_description) {
            return new uiError_1.default({
                message: messagePrefix + " : " + e.error,
                statusCode: 400,
                area: 'OAuth',
                details: e.error_description
            });
        }
        // Handle other exception types
        var error = ErrorHandler.getFromException(e);
        error.message = messagePrefix + " : " + error.message;
        return error;
    };
    /*
     * Return an object for Ajax errors
     */
    ErrorHandler.getFromAjaxError = function (xhr, url) {
        // Already handled errors
        if (xhr instanceof uiError_1.default) {
            return xhr;
        }
        var error = new uiError_1.default({
            message: 'Error calling server',
            statusCode: xhr.status,
            area: 'Ajax',
            url: url
        });
        if (xhr.status === 0) {
            error.area += ' / CORS';
            error.message = 'Cross origin request was not allowed';
        }
        else if (xhr.status === 200) {
            error.area = ' / Parse';
            error.message = 'Receiving JSON data failed';
        }
        else {
            // See if there is an API error
            var apiError = ErrorHandler._getApiErrorFromResponse(xhr.responseText);
            if (apiError && apiError.area && apiError.message) {
                error.area = "API / " + apiError.area;
                error.message = apiError.message;
            }
        }
        return error;
    };
    /*
     * Return an error based on the exception type or properties
     */
    ErrorHandler.getFromException = function (e) {
        // Already handled errors
        if (e instanceof uiError_1.default) {
            return e;
        }
        if (e instanceof Error) {
            return ErrorHandler._getFromString(e.message);
        }
        return ErrorHandler._getFromString(e);
    };
    /*
     * Try to deserialize an API error object
     */
    ErrorHandler._getApiErrorFromResponse = function (responseText) {
        try {
            return JSON.parse(responseText);
        }
        catch (e) {
            return null;
        }
    };
    /*
     * Handle Javascript exceptions as strings
     */
    ErrorHandler._getFromString = function (message) {
        return new uiError_1.default({
            message: 'Problem encountered',
            area: 'Exception',
            details: message
        });
    };
    return ErrorHandler;
}());
exports.default = ErrorHandler;
