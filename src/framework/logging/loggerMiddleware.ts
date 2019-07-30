import {NextFunction, Request, Response} from 'express';
import {Logger} from 'winston';
import {FRAMEWORKTYPES} from '../configuration/frameworkTypes';
import {ChildContainerHelper} from '../utilities/childContainerHelper';
import {ILogEntry} from './ilogEntry';
import {ILoggerFactory} from './iloggerFactory';
import {LoggerFactory} from './loggerFactory';

/*
 * A class to log API requests as JSON objects so that we get structured logging output
 */
export class LoggerMiddleware {

    private readonly _loggerFactory: LoggerFactory;
    private readonly _logger: Logger;

    /*
     * Create the global logger at startup, which is responsible for receiving data
     */
    public constructor(loggerFactory: ILoggerFactory) {
        this._loggerFactory = loggerFactory as LoggerFactory;
        this._logger = loggerFactory.getProductionLogger();
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
        container.bind<ILogEntry>(FRAMEWORKTYPES.ILogEntry).toConstantValue(logEntry);

        // Start the log entry for this API request
        logEntry.start(request);

        // Write the log entry when the finish event fires
        response.on('finish', () => {
            logEntry.end(response);
            logEntry.write(this._logger);
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
