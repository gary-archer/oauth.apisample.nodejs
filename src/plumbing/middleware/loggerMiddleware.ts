import {NextFunction, Request, Response} from 'express';
import {BASETYPES} from '../dependencies/baseTypes.js';
import {ChildContainerHelper} from '../dependencies/childContainerHelper.js';
import {LogEntry} from '../logging/logEntry.js';
import {LoggerFactory} from '../logging/loggerFactory.js';
import {LoggerFactoryImpl} from '../logging/loggerFactoryImpl.js';

/*
 * A class to log API requests as JSON objects so that we get structured logging output
 */
export class LoggerMiddleware {

    private readonly _loggerFactory: LoggerFactoryImpl;

    /*
     * Create the global logger at startup, which is responsible for receiving data
     */
    public constructor(loggerFactory: LoggerFactory) {
        this._loggerFactory = loggerFactory as LoggerFactoryImpl;
        this._setupCallbacks();
    }

    /*
     * Log one API request
     */
    public logRequest(request: Request, response: Response, next: NextFunction): void {

        // Create the log entry for this API request
        const logEntry = this._loggerFactory.createLogEntry();

        // Register it against this request's child container so that it can be injected into other places
        const container = ChildContainerHelper.resolve(request);
        container.bind<LogEntry>(BASETYPES.LogEntry).toConstantValue(logEntry);

        // Start the log entry for this API request
        logEntry.start(request);

        // Write the log entry when the finish event fires
        response.on('finish', () => {
            logEntry.end(response);
            logEntry.write();
        });

        next();
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private _setupCallbacks(): void {
        this.logRequest = this.logRequest.bind(this);
    }
}
