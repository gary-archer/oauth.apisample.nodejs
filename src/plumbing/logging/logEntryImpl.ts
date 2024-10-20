import {Request, Response} from 'express';
import {Guid} from 'guid-typescript';
import {injectable} from 'inversify';
import os from 'os';
import {Logger} from 'winston';
import {ClientError} from '../errors/clientError.js';
import {ServerError} from '../errors/serverError.js';
import {LogEntry} from './logEntry.js';
import {LogEntryData} from './logEntryData.js';
import {PerformanceBreakdown} from './performanceBreakdown.js';
import {RouteMetadata} from './routeMetadata.js';

/*
 * The full implementation class is private to the framework and excluded from the index.ts file
 */
@injectable()
export class LogEntryImpl implements LogEntry {

    private readonly _logger: Logger;
    private readonly _data: LogEntryData;

    /*
     * A log entry is created once per API request
     */
    public constructor(apiName: string, logger: Logger, performanceThresholdMilliseconds: number) {

        // Record the logger details
        this._logger = logger;

        // Initialise data
        this._data = new LogEntryData();
        this._data.apiName = apiName;
        this._data.hostName = os.hostname();
        this._data.performanceThresholdMilliseconds = performanceThresholdMilliseconds;
    }

    /*
     * Start collecting data before calling the API's business logic
     */
    public start(request: Request, routeMetadata: RouteMetadata | null): void {

        // Read request details
        this._data.performance.start();
        this._data.method = request.method;
        this._data.path = request.originalUrl;

        // Our callers can supply a custom header so that we can keep track of who is calling each API
        const clientName = request.header('x-authsamples-api-client');
        if (clientName) {
            this._data.clientName = clientName;
        }

        // Use the correlation id from request headers or create one
        const correlationId = request.header('x-authsamples-correlation-id');
        this._data.correlationId = correlationId ? correlationId : Guid.create().toString();

        // Log an optional session id if supplied
        const sessionId = request.header('x-authsamples-session-id');
        if (sessionId) {
            this._data.sessionId = sessionId;
        }

        // Record route metadata if available
        if (routeMetadata) {
            this._data.operationName = routeMetadata.operationName;
            this._data.resourceId = routeMetadata.resourceIds.join('/');
        }
    }

    /*
     * Add identity details for secured requests
     */
    public setIdentity(subject: string): void {
        this._data.userId = subject;
    }

    /*
     * An internal method for setting the operation name
     */
    public setOperationName(name: string): void {
        this._data.operationName = name;
    }

    /*
     * Create a child performance breakdown when requested
     */
    public createPerformanceBreakdown(name: string): PerformanceBreakdown {
        return this._data.performance.createChild(name);
    }

    /*
     * Add error details after they have been processed by the exception handler, including denormalised fields
     */
    public setServerError(error: ServerError): void {
        this._data.errorData = error.toLogFormat(this._data.apiName);
        this._data.errorCode = error.getErrorCode();
        this._data.errorId = error.getInstanceId();
    }

    /*
     * Add error details after they have been processed by the exception handler, including denormalised fields
     */
    public setClientError(error: ClientError): void {
        this._data.errorData = error.toLogFormat();
        this._data.errorCode = error.getErrorCode();
    }

    /*
     * Enable free text to be added to production logs, though this should be avoided in most cases
     */
    public addInfo(info: any): void {
        this._data.infoData.push(info);
    }

    /*
     * Finish collecting data at the end of the API request
     */
    public end(response: Response): void {

        // Finish performance measurements
        this._data.performance.dispose();

        // Record response details
        this._data.statusCode = response.statusCode;

        // Finalise this log entry
        this._data.finalise();
    }

    /*
     * Output our data
     */
    public write(): void {

        this._writeDataItem(this._data);
    }

    /*
     * Write a single data item
     */
    private _writeDataItem(item: LogEntryData): void {

        // Get the object to log
        const logData = item.toLogFormat();

        // Output it
        if (item.errorData) {
            this._logger.error(logData);
        } else {
            this._logger.info(logData);
        }
    }
}
