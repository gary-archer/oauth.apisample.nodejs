'use strict';
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
    static loadAppConfiguration(filePath: string): any {
        
        return $.ajax({
                url: filePath,
                type: 'GET',
                dataType: 'json'
            })
            .catch(xhr => {
                let error = ErrorHandler.getFromAjaxError(xhr, filePath);
                return Promise.reject(error);
            });
    }
    
    /*
     * Get data from an API URL and handle retries if needed
     */
    static callApi(url: string, method: string, dataToSend: any, authenticator: any): any {
        
        // Get a token if required
        return authenticator
            .getAccessToken()
            .then(at => {
            
                // Call the API
                return HttpClient._callApiWithToken(url, method, dataToSend, authenticator, at);
            })
            .catch(e => {

                // Already handled errors
                if (e instanceof UIError) {
                    return Promise.reject(e);
                }

                // Non Ajax errors
                if (!e.status) {
                    throw e;
                }
                    
                // Ajax errors
                let xhr = e;
                if (xhr.status === 401) {

                    // Handle 401s by clearing the failing access token from storage
                    return authenticator.clearAccessToken()
                        .then(() => {
                            
                            // Get a new access token
                            return authenticator
                                .getAccessToken()
                                .then(at => {

                                    // Call the API again
                                    return HttpClient._callApiWithToken(url, method, dataToSend, authenticator, at);
                                });
                        });
                }
                else {
                    
                    // Report Ajax errors
                    let ajaxError = ErrorHandler.getFromAjaxError(xhr, url);
                    return Promise.reject(ajaxError);
                }
            });
    }
    
    /*
     * Do the work of calling the API
     */
    static _callApiWithToken(url: string, method: string, dataToSend: any, authenticator: any, accessToken: string): any {
        
        let dataToSendText = JSON.stringify(dataToSend | <any>{});
        return $.ajax({
                    url: url,
                    data: dataToSendText,
                    dataType: 'json',
                    contentType: 'application/json',
                    type: method,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader ('Authorization', 'Bearer ' + accessToken);
                    }
            })
    }
}