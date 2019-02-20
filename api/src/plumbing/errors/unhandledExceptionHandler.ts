import {NextFunction, Request, Response} from 'express';
import {ErrorHandler} from '../../framework/errors/errorHandler';
import {ResponseWriter} from '../../framework/utilities/responseWriter';

/*
 * Our unhandled exception class, which gives us some control over how we use the framework
 */
export class UnhandledExceptionHandler {

    /*
     * Process any exceptions from controllers or middleware
     */
    public handleException(unhandledException: any, request: Request, response: Response, next: NextFunction): void {

        // Log the exception and get an error object to return to the client
        const clientError = ErrorHandler.handleError(unhandledException);

        // Manage writing the client response
        ResponseWriter.writeObjectResponse(
            request,
            response,
            clientError.statusCode,
            clientError.toResponseFormat());
    }
}
