import {NextFunction, Request, Response} from 'express';
import {ErrorHandler} from '../framework/errors/errorHandler';
import {ResponseWriter} from '../framework/utilities/responseWriter';

/*
 * Our unhandled exception class
 */
export class UnhandledExceptionHandler {

    /*
     * Process any exceptions from controllers or middleware
     */
    public handleException(unhandledException: any, request: Request, response: Response, next: NextFunction): void {

        const clientError = ErrorHandler.handleError(unhandledException);
        ResponseWriter.writeObjectResponse(response, clientError.statusCode, clientError.toResponseFormat());
    }
}
