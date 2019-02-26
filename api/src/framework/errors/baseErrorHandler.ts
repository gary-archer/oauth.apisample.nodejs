import {ApiLogger} from '../utilities/apiLogger';
import {ApiError} from './apiError';
import {IClientError} from './iclientError';

/*
 * A base error handler class
 */
export class BaseErrorHandler {

    /*
     * Do error handling and logging, then return an error to the client
     */
    public handleError(exception: any): IClientError {

        // Already handled API errors
        let apiError = this.tryConvertToApiError(exception);
        if (apiError !== null) {

            // Log the error, which will include technical support details
            ApiLogger.error(JSON.stringify(apiError.toLogFormat()));

            // Return a client error to the caller
            return apiError.toClientError();
        }

        // If the API has thrown a 4xx error using an IClientError derived type then it is logged here
        const clientError = this.tryConvertToClientError(exception);
        if (clientError !== null) {

            // Log the error without an id
            ApiLogger.error(JSON.stringify(clientError.toLogFormat()));

            // Return the thrown error to the caller
            return clientError;
        }

        // Unhandled exceptions
        apiError = this.fromException(exception);
        const errorToLog = apiError.toLogFormat();
        ApiLogger.error(JSON.stringify(errorToLog));
        return apiError.toClientError();
    }

    /*
     * A default implementation for creating an API error from an unrecognised exception
     */
    protected fromException(exception: any): ApiError {

        const apiError = new ApiError('server_error', 'An unexpected exception occurred in the API');
        apiError.details = this._getExceptionDetails(exception);
        apiError.stack = exception.stack;
        return apiError;
    }

    /*
     * Try to convert an exception to a known type
     */
    protected tryConvertToApiError(exception: any): ApiError | null {

        if (exception instanceof ApiError) {
            return exception as ApiError;
        }

        return null;
    }

    /*
     * Try to convert an exception to an interface
     * We have to use a TypeScript specific method of checking for known members
     */
    protected tryConvertToClientError(exception: any): IClientError | null {

        if (exception.getStatusCode && exception.toResponseFormat && exception.toLogFormat) {
            return exception as IClientError;
        }

        return null;
    }

    /*
     * Given an exception try to return a good string representation
     */
    protected _getExceptionDetails(exception: any): string {

        if (exception.message) {
            return exception.message;
        } else {
            return exception.toString();
        }
    }
}
