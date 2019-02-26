import {NextFunction, Request, Response} from 'express';
import {BaseErrorHandler} from '../framework/errors/baseErrorHandler';
import {ResponseWriter} from '../framework/utilities/responseWriter';

/*
 * Our unhandled exception class, which gives us some control over how we use the framework
 */
export class UnhandledExceptionHandler extends BaseErrorHandler {

    public constructor() {
        super();
        this._setupCallbacks();
    }

    /*
     * Handle errors at application startup, such as those downloading metadata
     */
    public handleStartupException(exception: any) {
        this.handleError(exception);
    }

    /*
     * Process any exceptions from controllers
     */
    public handleException(unhandledException: any, request: Request, response: Response, next: NextFunction): void {

        // Log the exception and get an error object to return to the client
        const clientError = this.handleError(unhandledException);

        // Manage writing the client response
        ResponseWriter.writeObjectResponse(
            request,
            response,
            clientError.getStatusCode(),
            clientError.toResponseFormat());
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private _setupCallbacks(): void {
        this.handleException = this.handleException.bind(this);
    }
}
