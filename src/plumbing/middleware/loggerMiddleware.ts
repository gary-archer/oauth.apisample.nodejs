import {NextFunction, Request, Response} from 'express';
import {Container} from 'inversify';
import {BASETYPES} from '../dependencies/baseTypes.js';
import {LogEntry} from '../logging/logEntry.js';
import {LoggerFactory} from '../logging/loggerFactory.js';
import {LoggerFactoryImpl} from '../logging/loggerFactoryImpl.js';
import {RouteLogInfoHandler} from '../routes/routeLogInfoHandler.js';
import {RouteMetadata} from '../routes/routeMetadata.js';

/*
 * A class to log API requests as JSON objects so that we get structured logging output
 */
export class LoggerMiddleware {

    private readonly loggerFactory: LoggerFactoryImpl;
    private readonly routeLogInfoHandler: RouteLogInfoHandler;

    public constructor(loggerFactory: LoggerFactory, routes: RouteMetadata[]) {

        this.loggerFactory = loggerFactory as LoggerFactoryImpl;
        this.routeLogInfoHandler = new RouteLogInfoHandler(routes);
        this.setupCallbacks();
    }

    /*
     * Log one API request
     */
    public execute(request: Request, response: Response, next: NextFunction): void {

        // Create the log entry for this API request
        const logEntry = this.loggerFactory.createLogEntry();

        // Register it against this request's child container so that it can be injected into other places
        const container = response.locals.container as Container;
        container.bind<LogEntry>(BASETYPES.LogEntry).toConstantValue(logEntry);

        // Start the log entry for this API request
        logEntry.start(request, this.routeLogInfoHandler);

        response.on('finish', () => {

            // End logging
            logEntry.end(response);

            // Write request logs for technical support purposes
            this.loggerFactory.getRequestLogger()?.info(logEntry.getRequestLog());

            // Write audit logs for security purposes
            this.loggerFactory.getAuditLogger()?.info(logEntry.getAuditLog());
        });

        next();
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private setupCallbacks(): void {
        this.execute = this.execute.bind(this);
    }
}
