'use strict';
const ApiError = require('./apiError');
const ApiLogger = require('./apiLogger');

/*
 * A class to handle composing and reporting errors
 */
class ErrorHandler {
    
    /*
     * Handle logging the error server side and returning an error object to the client
     */
    static reportError(response, exception) {
       
        try {
            // Ensure that the error is of type ApiError
            let error = ErrorHandler._fromException(exception);
            
            // Log the full error to the service
            let serverError = {
                message: error.message,
                statusCode: error.statusCode,
                area: error.area,
                url: error.url,
                details: error.details
            };
            ApiLogger.error(JSON.stringify(serverError));
            
            // Return a simple error object to the client
            let clientError = {
                area: error.area,
                message: error.message
            };

            // Set the client status code
            let clientStatusCode = (serverError.statusCode === 401) ? 401 : 500;
            
            // Set the WWW-Authenticate header if returning a 401
            if (clientStatusCode === 401) {
                let headerValue = 'Bearer';
                if (clientError.message.indexOf('expired') !== -1) {
                    headerValue += ',error="invalid_token"';
                }
                response.setHeader('WWW-Authenticate', headerValue);
            }
            
            // Send the response to the client
            response.status(clientStatusCode).send(JSON.stringify(clientError));
        }
        catch(e) {

            // Make sure error reporting error do not escape
            ApiLogger.info(`Problem encountered: ${e}`);
        }
    }
    
    /*
     * Get an error object for a missing token
     */
    static getNoTokenError() {
        
        return new ApiError({
            statusCode: 401,
            area: 'Token',
            message: 'No access token supplied'
        });
    }

    /*
     * Get an error object for token expired / revoked
     */
    static getTokenExpiredError() {
        
        return new ApiError({
            statusCode: 401,
            area: 'Token',
            message: 'Invalid or expired access token'
        });
    }
    
    /*
     * Handle the request promise error for metadata lookup failures
     */
    static fromMetadataError(responseError, url) {
        
        let apiError = new ApiError({
            statusCode: 500,
            area: 'MetadataLookup',
            url: url,
            message: 'Metadata lookup failed'
        });
        ErrorHandler._updateErrorFromHttpResponse(apiError, responseError);
        return apiError;
    }
    
    /*
     * Handle the request promise error for introspection failures
     */
    static fromIntrospectionError(responseError, url) {
        
        // Already handled expired errors
        if (responseError instanceof ApiError) {
            return responseError;
        }

        let apiError = new ApiError({
            statusCode: 500,
            area: 'TokenValidation',
            url: url,
            message: 'Token validation failed'
        });
        ErrorHandler._updateErrorFromHttpResponse(apiError, responseError);
        return apiError;
    }
    
    /*
     * Handle the request promise error for user info failures
     */
    static fromUserInfoError(responseError, url) {
        
        let apiError = new ApiError({
            statusCode: 500,
            area: 'UserDataLookup',
            url: url,
            message: 'User data lookup failed'
        });
        ErrorHandler._updateErrorFromHttpResponse(apiError, responseError);
        return apiError;
    }
    
    /*
     * Update error fields with response details
     */
    static _updateErrorFromHttpResponse(apiError, responseError) {
        
        if (responseError.name) {
            apiError.errorCode = responseError.name;
        }
        
        if (responseError.error && responseError.error.error && responseError.error.error_description) {
            
            // Include OAuth error details if returned
            apiError.message += ` : ${responseError.error.error}`;
            apiError.details = responseError.error.error_description;
        }
        else {
          
            // Otherwise capture exception details
            if (responseError.name) {
                apiError.message += ` : ${responseError.name}`;
            }
            if (responseError.message) {
                apiError.details = responseError.message;
            }
        }
    }
    
    /*
     * Ensure that all errors are of ApiError exception type
     */
    static _fromException(exception) {
        
        // Already handled
        if (exception instanceof ApiError) {
            return exception;
        }
        
        if (exception instanceof Error) {
            return ErrorHandler._fromStringError(exception.message);
        }
        
        return ErrorHandler._fromStringError(exception);
    }
    
    /*
     * Handle Javascript exceptions as strings
     */
    static _fromStringError(e) {
        
        return new ApiError({
            statusCode: 500,
            message: 'Problem encountered',
            area: 'Exception',
            details: e
        });
    }
}

module.exports = ErrorHandler;