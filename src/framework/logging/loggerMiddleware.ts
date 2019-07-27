import {NextFunction, Request, Response} from 'express';
import {Logger} from 'winston';
import {ILoggerFactory} from '../logging/iloggerFactory';
import {LogEntry} from './logEntry';

/*
 * A class to log API requests as JSON objects so that we get structured logging output
 */
export class LoggerMiddleware {

    private readonly _logger: Logger;

    /*
     * Receive dependencies
     */
    public constructor(loggerFactory: ILoggerFactory) {
        this._logger = loggerFactory.getProductionLogger();
        this._setupCallbacks();
    }

    /*
     * Log one API request
     */
    public logRequest(request: Request, response: Response, next: NextFunction): void {

        // Create the log entry for this API request
        const logEntry = LogEntry.getCurrent(request);

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
