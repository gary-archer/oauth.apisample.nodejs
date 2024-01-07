import {BaseErrorCodes} from './baseErrorCodes.js';
import {ClientError} from './clientError.js';
import {ErrorFactory} from './errorFactory.js';
import {ServerError} from './serverError.js';

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
     * The error thrown if we cannot find an expected claim during security handling
    * This is the same underlying problem as a missing scope and typically caused by incorrect configuration
     */
    public static fromMissingClaim(claimName: string): ClientError {

        return ErrorFactory.createClientErrorWithContext(
            403,
            BaseErrorCodes.insufficientScope,
            'The token does not contain sufficient scope for this API',
            `Missing claim in input: '${claimName}'`
        );
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
