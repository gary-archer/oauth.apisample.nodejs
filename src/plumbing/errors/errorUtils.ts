import {ErrorFactory} from '../../../framework-api-base';
import {ExtendedError} from '../../../framework-base';
import {ApiError} from './apiError';
import {BaseErrorCodes} from './baseErrorCodes';
import {ClientError} from './clientError';

/*
 * General error utility functions
 */
export class ErrorUtils {

    /*
     * Return or create a typed error
     */
    public static fromException(exception: any): ApiError | ClientError {

        const apiError = this.tryConvertToApiError(exception);
        if (apiError !== null) {
            return apiError;
        }

        const clientError = this.tryConvertToClientError(exception);
        if (clientError !== null) {
            return clientError;
        }

        return ErrorUtils.createApiError(exception);
    }

    /*
     * Create an error from an exception
     */
    public static createApiError(exception: any, errorCode?: string, message?: string): ApiError {

        // Default details
        const defaultErrorCode = BaseErrorCodes.serverError;
        const defaultMessage = 'An unexpected exception occurred in the API';

        // Create the error
        const error = ErrorFactory.createApiError(
            errorCode || defaultErrorCode,
            message || defaultMessage,
            exception.stack);
        error.setDetails(ErrorUtils._getExceptionDetailsMessage(exception));
        return error;
    }

    /*
     * The error thrown if we cannot find an expected claim during security handling
     */
    public static fromMissingClaim(claimName: string): ApiError {

        const apiError = ErrorFactory.createApiError(BaseErrorCodes.claimsFailure, 'Authorization Data Not Found');
        apiError.setDetails(`An empty value was found for the expected claim ${claimName}`);
        return apiError;
    }

    /*
     * Handle metadata lookup failures
     */
    public static fromMetadataError(responseError: any, url: string): ApiError {

        const apiError = ErrorFactory.createApiError(
            OAuthErrorCodes.metadataLookupFailure,
            'Metadata lookup failed',
            responseError.stack);

        OAuthErrorUtils._setErrorDetails(apiError, null, responseError, url);
        return apiError;
    }

    /*
     * Handle introspection failures
     */
    public static fromIntrospectionError(responseError: any, url: string): ApiError | ClientError {

        // Avoid reprocessing
        if (responseError instanceof ApiError) {
            return responseError;
        }
        if (responseError instanceof ClientError) {
            return responseError;
        }

        const [code, description] = OAuthErrorUtils._readOAuthErrorResponse(responseError);
        const apiError = OAuthErrorUtils._createOAuthApiError(
            OAuthErrorCodes.introspectionFailure,
            'Token validation failed',
            code,
            responseError.stack);

        OAuthErrorUtils._setErrorDetails(apiError, description, responseError, url);
        return apiError;
    }

    /*
     * Handle user info lookup failures
     */
    public static fromUserInfoError(responseError: any, url: string): ApiError {

        // Handle a race condition where the access token expires during user info lookup
        if (responseError.error && responseError.error === 'invalid_token') {
            throw ErrorFactory.create401Error('Access token expired during user info lookup');
        }

        // Avoid reprocessing
        if (responseError instanceof ApiError) {
            return responseError;
        }

        const [code, description] = OAuthErrorUtils._readOAuthErrorResponse(responseError);
        const apiError = OAuthErrorUtils._createOAuthApiError(
            OAuthErrorCodes.userinfoFailure,
            'User info lookup failed',
            code,
            responseError.stack);

        OAuthErrorUtils._setErrorDetails(apiError, description, responseError, url);
        return apiError;
    }

    /*
     * The error thrown if we cannot find an expected claim during security handling
     */
    public static fromMissingClaim(claimName: string): ApiError {

        const apiError = ErrorFactory.createApiError(BaseErrorCodes.claimsFailure, 'Authorization Data Not Found');
        apiError.setDetails(`An empty value was found for the expected claim ${claimName}`);
        return apiError;
    }

    /*
     * Return the error and error_description fields from an OAuth error message if present
     */
    private static _readOAuthErrorResponse(responseError: any): [string | null, string | null] {

        let code = null;
        let description = null;

        if (responseError.response && responseError.response.body) {

            if (responseError.response.body.error) {
                code = responseError.response.body.error;
            }

            if (responseError.response.body.error_description) {
                description = responseError.response.body.error_description;
            }
        }

        return [code, description];
    }

    /*
     * Create an error object from an error code and include the OAuth error code in the user message
     */
    private static _createOAuthApiError(
        errorCode: string,
        userMessage: string,
        oauthErrorCode: string | null,
        stack: string | undefined): ApiError {

        // Include the OAuth error code in the short technical message returned
        let message = userMessage;
        if (errorCode) {
            message += ` : ${oauthErrorCode}`;
        }

        return ErrorFactory.createApiError(errorCode, message, stack);
    }

    /*
     * Update the API error object with technical exception details
     */
    private static _setErrorDetails(
        error: ApiError,
        oauthDetails: string | null,
        responseError: any,
        url: string): void {

        let detailsText = '';
        if (oauthDetails) {
            detailsText += oauthDetails;
        } else {
            detailsText += OAuthErrorUtils._getExceptionDetailsMessage(responseError);
        }

        if (url) {
            detailsText += `, URL: ${url}`;
        }
        error.setDetails(detailsText);
    }

    /*
     * Get the message from an exception and avoid returning [object Object]
     */
    private static _getExceptionDetailsMessage(e: any): string {

        if (e.message) {
            return e.message;
        } else {
            const details = e.toString();
            if (details !== {}.toString()) {
                return details;
            } else {
                return '';
            }
        }
    }

    /*
     * See if the exception is convertible to a REST API error
     */
    private static tryConvertToApiError(exception: any): ApiError | null {

        // Already handled
        if (exception instanceof ApiError) {
            return exception as ApiError;
        }

        // Convert from our technology neutral custom exception to an API specific error
        if (exception instanceof ExtendedError) {
            const error = exception as ExtendedError;

            const apiError = ErrorFactory.createApiError(
                error.code,
                error.message,
                error.stack);

            if (error.details) {
                apiError.setDetails(error.details);
            }

            return apiError;
        }

        return null;
    }

    /*
     * Try to convert an exception to a ClientError
     */
    private static tryConvertToClientError(exception: any): ClientError | null {

        if (exception instanceof ClientError) {
            return exception as ClientError;
        }

        return null;
    }

    /*
     * Get the message from an exception and avoid returning [object Object]
     */
    private static _getExceptionDetailsMessage(e: any): string {

        if (e.message) {
            return e.message;
        } else {
            const details = e.toString();
            if (details !== {}.toString()) {
                return details;
            } else {
                return '';
            }
        }
    }
}
