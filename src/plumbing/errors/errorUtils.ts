import {BaseErrorCodes} from './baseErrorCodes';
import {ClientError} from './clientError';
import {ErrorFactory} from './errorFactory';
import {ServerError} from './serverError';

/*
 * General error utility functions
 */
export class ErrorUtils {

    /*
     * Return or create a typed error
     */
    public static fromException(exception: any): ServerError | ClientError {

        const serverError = this.tryConvertToServerError(exception);
        if (serverError !== null) {
            return serverError;
        }

        const clientError = this.tryConvertToClientError(exception);
        if (clientError !== null) {
            return clientError;
        }

        return ErrorUtils.createServerError(exception);
    }

    /*
     * Create an error from an exception
     */
    public static createServerError(exception: any, errorCode?: string, message?: string): ServerError {

        // Default details
        const defaultErrorCode = BaseErrorCodes.serverError;
        const defaultMessage = 'An unexpected exception occurred in the API';

        // Create the error
        const error = ErrorFactory.createServerError(
            errorCode || defaultErrorCode,
            message || defaultMessage,
            exception.stack);
        error.setDetails(ErrorUtils._getExceptionDetailsMessage(exception));
        return error;
    }

    /*
     * Handle the error for key identifier lookups
     */
    public static fromSigningKeyDownloadError(responseError: any, url: string): ServerError {

        const error = ErrorFactory.createServerError(
            BaseErrorCodes.tokenSigningKeysDownloadError,
            'Problem downloading token signing keys',
            responseError.stack);

        const details = ErrorUtils._getExceptionDetailsMessage(responseError);
        error.setDetails(`${details}, URL: ${url}`);
        return error;
    }

    /*
     * Handle user info lookup failures
     */
    public static fromUserInfoError(e: any, url: string): ServerError | ClientError {

        // Avoid reprocessing
        if (e instanceof ServerError) {
            return e;
        }

        // Collect the parts of the error, including the standard OAuth error / error_description fields
        let status = 0;
        if (e.response && e.response.status) {
            status = e.response.status;
        }

        let responseData: any = {};
        if (e.response && e.response.data && typeof e.response.data === 'object') {
            responseData = e.response.data;
        }

        const parts: string[] = [];
        parts.push('User info lookup failed');
        if (status) {
            parts.push(`Status: ${status}`);
        }
        if (responseData.error) {
            parts.push(`Code: ${responseData.error}`);
        }
        if (responseData.error_description) {
            parts.push(`Description: ${responseData.error_description}`);
        }
        parts.push(`URL: ${url}`);
        const details = parts.join(', ');

        // Report 401 errors where the access token is rejected
        if (status === 401) {
            return ErrorFactory.createClient401Error(details);
        }

        // Otherwise report technical failures
        const error = ErrorFactory.createServerError(
            BaseErrorCodes.userinfoFailure,
            'User info lookup failed',
            e.stack);
        error.setDetails(details);
        return error;
    }

    /*
     * The error thrown if we cannot find an expected claim during security handling
     */
    public static fromMissingClaim(claimName: string): ClientError {

        return ErrorFactory.createClientErrorWithContext(
            400,
            BaseErrorCodes.claimsFailure,
            'Authorization data not found',
            `Missing claim in input: ${claimName}`);
    }

    /*
     * See if the exception is convertible to a server error
     */
    private static tryConvertToServerError(exception: any): ServerError | null {

        // Already handled
        if (exception instanceof ServerError) {
            return exception;
        }

        return null;
    }

    /*
     * Try to convert an exception to a client error
     */
    private static tryConvertToClientError(exception: any): ClientError | null {

        if (exception instanceof ClientError) {
            return exception;
        }

        return null;
    }

    /*
     * Get the message from an exception and avoid returning [object Object]
     */
    private static _getExceptionDetailsMessage(e: any): string {

        if (e.message) {
            return e.message;
        }

        const details = e.toString();
        if (details !== {}.toString()) {
            return details;
        }

        return '';
    }
}
