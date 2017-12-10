import ErrorHandler from './errorHandler';
import UIError from './uiError';
import * as $ from 'jquery';

/*
 * Logic related to making HTTP calls
 */
export default class HttpClient {
    
    /*
     * Download JSON data from the app config file
     */
    public static async loadAppConfiguration(filePath: string): Promise<any> {
        
        try {
            // Make the call
            return await $.ajax({
                    url: filePath,
                    type: 'GET',
                    dataType: 'json'
                });
        }
        catch(xhr) {
            // Improve the default error message
            throw ErrorHandler.getFromAjaxError(xhr, filePath);
        }
    }
    
    /*
     * Get data from an API URL and handle retries if needed
     */
    public static async callApi(url: string, method: string, dataToSend: any, authenticator: any): Promise<any> {
        
        // Get a token, which will log the user in if needed
        let token = await authenticator.getAccessToken();
        
        try {
            // Call the API
            return await HttpClient._callApiWithToken(url, method, dataToSend, authenticator, token);
        }
        catch (xhr) {
            // Non 401 errors are already handled so rethrow them
            if (xhr instanceof UIError) {
                throw xhr;
            }

            if (xhr.status === 401) {

                // Clear the failing access token from storage and get a new one
                await authenticator.clearAccessToken();
                let token = await authenticator.getAccessToken();

                // Call the API again
                return await HttpClient._callApiWithToken(url, method, dataToSend, authenticator, token);
            }
        }
    }
    
    /*
     * Do the work of calling the API
     */
    private static async _callApiWithToken(url: string, method: string, dataToSend: any, authenticator: any, accessToken: string): Promise<any> {
        
        let dataToSendText = JSON.stringify(dataToSend | <any>{});
        
        try {
            return await $.ajax({
                        url: url,
                        data: dataToSendText,
                        dataType: 'json',
                        contentType: 'application/json',
                        type: method,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader ('Authorization', 'Bearer ' + accessToken);
                        }
                    });
        }
        catch(xhr) {

            // Rethrow 401s to the caller
            if (xhr.status === 401) {
                throw xhr;
            }

            // Report Ajax errors
            let ajaxError = ErrorHandler.getFromAjaxError(xhr, url);
            throw ajaxError;
        }
    }
}