import {NextFunction, Request, Response} from 'express';
import {Container} from 'inversify';
import {BASETYPES} from '../dependencies/baseTypes.js';
import {LogEntry} from '../logging/logEntry.js';
import {LoggerFactory} from '../logging/loggerFactory.js';
import {LoggerFactoryImpl} from '../logging/loggerFactoryImpl.js';
import {RouteMetadataHandler} from '../logging/routeMetadataHandler.js';

/*
 * A class to log API requests as JSON objects so that we get structured logging output
 */
export class LoggerMiddleware {

    private readonly loggerFactory: LoggerFactoryImpl;
    private routeMetadataHandler!: RouteMetadataHandler;

    public constructor(loggerFactory: LoggerFactory) {
        this.loggerFactory = loggerFactory as LoggerFactoryImpl;
        this.setupCallbacks();
    }

    /*
     * Set metadata details needed to log particular request fields
     */
    public setRouteMetadataHandler(routeMetadataHandler: RouteMetadataHandler): void {
        this.routeMetadataHandler = routeMetadataHandler;
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
        const routeMetadata = this.routeMetadataHandler.getOperationRouteInfo(request);
        logEntry.start(request, routeMetadata);

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
    private setupCallbacks(): void {
        this.execute = this.execute.bind(this);
    }
}
