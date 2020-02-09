import {NextFunction, Request, Response} from 'express';
import {BASEFRAMEWORKTYPES} from '../../../framework-base';
import {FrameworkConfiguration} from '../configuration/frameworkConfiguration';
import {ApiError} from '../errors/apiError';
import {ApplicationExceptionHandler} from '../errors/applicationExceptionHandler';
import {ErrorUtils} from '../errors/errorUtils';
import {LogEntryImpl} from '../logging/logEntryImpl';
import {ChildContainerHelper} from '../utilities/childContainerHelper';
import {ResponseWriter} from '../utilities/responseWriter';

/*
 * The entry point for catching exceptions during API calls
 */
export class UnhandledExceptionHandler {

    private readonly _configuration: FrameworkConfiguration;
    private readonly _applicationExceptionHandler: ApplicationExceptionHandler;

    public constructor(
        configuration: FrameworkConfiguration,
        appExceptionHandler: ApplicationExceptionHandler) {

        this._configuration = configuration;
        this._applicationExceptionHandler = appExceptionHandler;
        this._setupCallbacks();
    }

    /*
     * Process any exceptions from controllers
     */
    public handleException(exception: any, request: Request, response: Response, next: NextFunction): void {

        // Get the exception to handle and allow the application to implement its own error logic first
        let exceptionToHandle = exception;
        exceptionToHandle = this._applicationExceptionHandler.translate(exception);

        // Get the log entry for this API request
        const perRequestContainer = ChildContainerHelper.resolve(request);
        const logEntry = perRequestContainer.get<LogEntryImpl>(BASEFRAMEWORKTYPES.LogEntry);

        // Get the error into a known object
        const error = ErrorUtils.fromException(exceptionToHandle);

        // Log and convert to the client error
        let clientError;
        if (error instanceof ApiError) {
            logEntry.setApiError(error);
            clientError = error.toClientError(this._configuration.apiName);
        } else {
            logEntry.setClientError(error);
            clientError = error;
        }

        // Write the client response
        const writer = new ResponseWriter();
        writer.writeObjectResponse(response, clientError.getStatusCode(), clientError.toResponseFormat());
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private _setupCallbacks(): void {
        this.handleException = this.handleException.bind(this);
    }
}
