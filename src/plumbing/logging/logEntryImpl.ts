import {randomUUID} from 'crypto';
import {Request, Response} from 'express';
import {injectable} from 'inversify';
import os from 'os';
import {Logger} from 'winston';
import {ClientError} from '../errors/clientError.js';
import {ServerError} from '../errors/serverError.js';
import {RouteMetadata} from '../utilities/routeMetadata.js';
import {LogEntry} from './logEntry.js';
import {LogEntryData} from './logEntryData.js';
import {PerformanceBreakdown} from './performanceBreakdown.js';

/*
 * The full implementation class is private to the framework and excluded from the index.ts file
 */
@injectable()
export class LogEntryImpl implements LogEntry {

    private readonly logger: Logger;
    private readonly data: LogEntryData;

    /*
     * A log entry is created once per API request
     */
    public constructor(apiName: string, logger: Logger, performanceThresholdMilliseconds: number) {

        // Record the logger details
        this.logger = logger;

        // Initialise data
        this.data = new LogEntryData();
        this.data.apiName = apiName;
        this.data.hostName = os.hostname();
        this.data.performanceThresholdMilliseconds = performanceThresholdMilliseconds;
    }

    /*
     * Start collecting data before calling the API's business logic
     */
    public start(request: Request, routes: RouteMetadata[]): void {

        // Read request details
        this.data.performance.start();
        this.data.method = request.method;
        this.data.path = request.originalUrl;

        // Our callers can supply a custom header so that we can keep track of who is calling each API
        const clientName = request.header('x-authsamples-api-client');
        if (clientName) {
            this.data.clientName = clientName;
        }

        // Use the correlation id from request headers or create one
        const correlationId = request.header('x-authsamples-correlation-id');
        this.data.correlationId = correlationId ? correlationId : randomUUID();

        // Log an optional session id if supplied
        const sessionId = request.header('x-authsamples-session-id');
        if (sessionId) {
            this.data.sessionId = sessionId;
        }

        const found = routes.find((r) =>
            r.path.toLowerCase() === this.data.path.toLowerCase() &&
            r.method.toLowerCase() === this.data.method.toLowerCase());
        if (found) {
            console.log('*** FOUND IT ***');
        }
    }

    /*
     * Add identity details for secured requests
     */
    public setIdentity(subject: string): void {
        this.data.userId = subject;
    }

    /*
     * An internal method for setting the operation name
     */
    public setOperationName(name: string): void {
        this.data.operationName = name;
    }

    /*
     * Create a child performance breakdown when requested
     */
    public createPerformanceBreakdown(name: string): PerformanceBreakdown {
        return this.data.performance.createChild(name);
    }

    /*
     * Add error details after they have been processed by the exception handler, including denormalised fields
     */
    public setServerError(error: ServerError): void {
        this.data.errorData = error.toLogFormat(this.data.apiName);
        this.data.errorCode = error.getErrorCode();
        this.data.errorId = error.getInstanceId();
    }

    /*
     * Add error details after they have been processed by the exception handler, including denormalised fields
     */
    public setClientError(error: ClientError): void {
        this.data.errorData = error.toLogFormat();
        this.data.errorCode = error.getErrorCode();
    }

    /*
     * Enable free text to be added to production logs, though this should be avoided in most cases
     */
    public addInfo(info: any): void {
        this.data.infoData.push(info);
    }

    /*
     * Finish collecting data at the end of the API request
     */
    public end(response: Response): void {

        // Finish performance measurements
        this.data.performance.dispose();

        // Record response details
        this.data.statusCode = response.statusCode;

        // Finalise this log entry
        this.data.finalise();
    }

    /*
     * Output our data
     */
    public write(): void {

        // Get the object to log
        const logData = this.data.toLogFormat();

        // Output it
        if (this.data.errorData) {
            this.logger.error(logData);
        } else {
            this.logger.info(logData);
        }
    }
}
