import {NextFunction, Request, Response} from 'express';
import {Container} from 'inversify';
import {LoggingConfiguration} from '../configuration/loggingConfiguration.js';
import {BASETYPES} from '../dependencies/baseTypes.js';
import {ClientError} from '../errors/clientError.js';
import {ErrorUtils} from '../errors/errorUtils.js';
import {ServerError} from '../errors/serverError.js';
import {LogEntryImpl} from '../logging/logEntryImpl.js';
import {ResponseWriter} from '../utilities/responseWriter.js';

/*
 * The entry point for catching exceptions during API calls
 */
export class UnhandledExceptionHandler {

    private readonly configuration: LoggingConfiguration;

    public constructor(configuration: LoggingConfiguration) {

        this.configuration = configuration;
        this.setupCallbacks();
    }

    /*
     * Process any thrown exceptions
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public onException(exception: any, request: Request, response: Response, next: NextFunction): void {

        // Get the log entry for this API request
        const container = response.locals.container as Container;
        const logEntry = container.get<LogEntryImpl>(BASETYPES.LogEntry);

        // Get the error into a known object
        const error = ErrorUtils.fromException(exception);

        // Log and convert to the client error
        let clientError: ClientError;
        if (error instanceof ServerError) {

            logEntry.setServerError(error);
            clientError = error.toClientError(this.configuration.apiName);

        } else {

            logEntry.setClientError(error);
            clientError = error;
        }

        // Return the error response
        ResponseWriter.writeErrorResponse(response, clientError);
    }

    /*
     * Process any not found routes
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public onNotFound(request: Request, response: Response, next: NextFunction): void {

        // Get the log entry for this API request
        const container = response.locals.container as Container;
        const logEntry = container.get<LogEntryImpl>(BASETYPES.LogEntry);

        // Log and convert to the client error
        const clientError = ErrorUtils.fromRouteNotFound();
        logEntry.setClientError(clientError);
        ResponseWriter.writeErrorResponse(response, clientError);
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private setupCallbacks(): void {
        this.onException = this.onException.bind(this);
        this.onNotFound = this.onNotFound.bind(this);
    }
}
