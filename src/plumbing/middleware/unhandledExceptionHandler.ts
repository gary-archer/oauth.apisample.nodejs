import {NextFunction, Request, Response} from 'express';
import {LoggingConfiguration} from '../configuration/loggingConfiguration.js';
import {BASETYPES} from '../dependencies/baseTypes.js';
import {ChildContainerHelper} from '../dependencies/childContainerHelper.js';
import {ErrorUtils} from '../errors/errorUtils.js';
import {ServerError} from '../errors/serverError.js';
import {LogEntryImpl} from '../logging/logEntryImpl.js';
import {ResponseErrorWriter} from '../utilities/responseErrorWriter.js';

/*
 * The entry point for catching exceptions during API calls
 */
export class UnhandledExceptionHandler {

    private readonly _configuration: LoggingConfiguration;

    public constructor(configuration: LoggingConfiguration) {

        this._configuration = configuration;
        this._setupCallbacks();
    }

    /*
     * Process any exceptions from controllers
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public handleException(exception: any, request: Request, response: Response, next: NextFunction): void {

        // Get the log entry for this API request
        const perRequestContainer = ChildContainerHelper.resolve(request);
        const logEntry = perRequestContainer.get<LogEntryImpl>(BASETYPES.LogEntry);

        // Get the error into a known object
        const error = ErrorUtils.fromException(exception);

        // Log and convert to the client error
        let clientError;
        if (error instanceof ServerError) {
            logEntry.setServerError(error);
            clientError = error.toClientError(this._configuration.apiName);
        } else {
            logEntry.setClientError(error);
            clientError = error;
        }

        // Write the client response
        const writer = new ResponseErrorWriter();
        writer.writeErrorResponse(response, clientError);
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private _setupCallbacks(): void {
        this.handleException = this.handleException.bind(this);
    }
}
