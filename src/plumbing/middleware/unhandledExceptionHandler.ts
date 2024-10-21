import {NextFunction, Request, Response} from 'express';
import {Container} from 'inversify';
import {LoggingConfiguration} from '../configuration/loggingConfiguration.js';
import {BASETYPES} from '../dependencies/baseTypes.js';
import {ClientError} from '../errors/clientError.js';
import {ErrorUtils} from '../errors/errorUtils.js';
import {ServerError} from '../errors/serverError.js';
import {LogEntryImpl} from '../logging/logEntryImpl.js';

/*
 * The entry point for catching exceptions during API calls
 */
export class UnhandledExceptionHandler {

    private readonly _configuration: LoggingConfiguration;

    public constructor(configuration: LoggingConfiguration) {

        this._configuration = configuration;
        this.setupCallbacks();
    }

    /*
     * Process any thrown exceptions
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public execute(exception: any, request: Request, response: Response, next: NextFunction): void {

        // Get the log entry for this API request
        const container = response.locals.container as Container;
        const logEntry = container.get<LogEntryImpl>(BASETYPES.LogEntry);

        // Get the error into a known object
        const error = ErrorUtils.fromException(exception);

        // Log and convert to the client error
        let clientError: ClientError;
        if (error instanceof ServerError) {

            logEntry.setServerError(error);
            clientError = error.toClientError(this._configuration.apiName);

        } else {

            logEntry.setClientError(error);
            clientError = error;
        }

        // Throw an error in the format that the routing controllers library expects
        response.setHeader('content-type', 'application/json');
        response.status(clientError.getStatusCode()).send(JSON.stringify(clientError.toResponseFormat()));
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private setupCallbacks(): void {
        this.execute = this.execute.bind(this);
    }
}
