import UIError from './uiError';
import IFrameWindowHelper from './iframeWindowHelper'
import * as $ from 'jquery';

/*
 * A class to handle composing and reporting errors
 */
export default class ErrorHandler {
    
    /*
     * Output fields from an AppError object, depending on what is populated
     */
    public static reportError(exception: any): void {
        
        // Ensure that the error is of type UIError
        let error = ErrorHandler.getFromException(exception);
        
        // Only report real errors
        if (error.nonError) {
            return;
        }
        
        // Make sure the hidden iframe outputs error details to the main window
        let errorContainer = IFrameWindowHelper.getMainWindowElement('#error');
        errorContainer.text('');
        
        if (error.message.length > 0) {
            errorContainer.append($('<li>').html(`<b>Message</b> : ${error.message}`));
        }

        if (error.statusCode > -1) {
            errorContainer.append($('<li>').html(`<b>Status Code</b> : ${error.statusCode}`));
        }
        
        if (error.area.length > 0) {
            errorContainer.append($('<li>').html(`<b>Area</b> : ${error.area}`));
        }
        
        if (error.url.length > 0) {
            errorContainer.append($('<li>').html(`<b>URL</b> : ${error.url}`));
        }

        $('#error').append($('<li>').html(`<b>Time</b> : ${error.time.toUTCString()}`));
        
        if (error.details.length > 0) {
            errorContainer.append($('<li>').html(`<b>Details</b> : ${error.details}`));
        }
        
        // Show the clear button
        let clearButton = IFrameWindowHelper.getMainWindowElement('#btnClearError');
        if (clearButton.hasClass('hide')) {
            clearButton.removeClass('hide');
        }
    }

    /*
     * Clear trace output
     */
    public static clear(): void {
        
        // Remove output
        let errorList = IFrameWindowHelper.getMainWindowElement('#error');
        errorList.html('');

        // Hide the clear button since
        let clearButton = IFrameWindowHelper.getMainWindowElement('#btnClearError');
        clearButton.addClass('hide');
    }
    
    /*
     * A non error is used to short circuit execution without displaying an error
     */
    public static getNonError(): UIError {
        
        return new UIError({
            nonError: true
        });
    }
    
    /*
     * Sign in request errors most commonly 
     */
    public static getFromOAuthRequest(e: any): UIError {
        
        // Already handled errors
        if (e instanceof UIError) {
            return e;
        }

        let message = 'Authentication request error';
        if (e.message) {
            message += `: ${e.message}`;
        }

        // Update fields and use a status of zero to hint that it may be a CORS error
        return new UIError({
            message: message,
            statusCode: 0,
            area: 'OAuth / CORS',
            details: e.toString()
        });
    }
    
    /*
     * Sign in request errors most commonly 
     */
    public static getFromOAuthResponse(e: any): UIError {
        
        // Already handled errors
        if (e instanceof UIError) {
            return e;
        }
        
        // Handle OAuth errors
        let messagePrefix = 'Authentication response error';
        if (e.error && e.error_description) {

            return new UIError({
                message: `${messagePrefix} : ${e.error}`,
                statusCode: 400,
                area: 'OAuth',
                details: e.error_description
            });
        }
        
        let message = messagePrefix;
        if (e.message) {
            message += `: ${e.message}`;
        }

        return new UIError({
            message: message,
            statusCode: 400,
            area: 'OAuth',
            details: e.toString()
        });
    }
    
    /*
     * Return an object for Ajax errors
     */
    public static getFromAjaxError(xhr: any, url: string): UIError {
        
        // Already handled errors
        if (xhr instanceof UIError) {
            return xhr;
        }
        
        let error = new UIError({
            message: 'Error calling server',
            statusCode: xhr.status,
            area: 'Ajax',
            url: url
        });
        
        if (xhr.status === 0 ) {
             
            error.area += ' / CORS';
            error.message = 'Cross origin request was not allowed';
        }
        else if (xhr.status === 200 ) {
            
            error.area = ' / JSON';
            error.message = 'Parsing JSON data failed';
        }
        else {
            
            // See if there is an API error
            let apiError = ErrorHandler._getApiErrorFromResponse(xhr.responseText);
            if (apiError && apiError.area && apiError.message) {
                error.area = `API / ${apiError.area}`;
                error.message = apiError.message;
            }
        }
        
        return error;
    }
    
    /*
     * Return an error based on the exception type or properties
     */
    public static getFromException(e: any): UIError {
        
        // Already handled errors
        if (e instanceof UIError) {
            return e;
        }
        
        // Call to string on the exception
        return new UIError({
            message: 'Problem encountered',
            area: 'Exception',
            details: e.toString()
        });
    }
    
    /*
     * Try to deserialize an API error object
     */
    private static _getApiErrorFromResponse(responseText: string): any {

        try {
            return JSON.parse(responseText);
        }
        catch(e) {
            return null;
        }
    }
}