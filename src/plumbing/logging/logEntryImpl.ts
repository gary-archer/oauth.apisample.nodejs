import {Request, Response} from 'express';
import {Guid} from 'guid-typescript';
import {injectable} from 'inversify';
import os from 'os';
import {Logger} from 'winston';
import {CoreApiClaims} from '../claims/coreApiClaims';
import {ApiError} from '../errors/apiError';
import {ClientError} from '../errors/clientError';
import {Disposable} from '../utilities/disposable';
import {ChildLogEntry} from './childLogEntry';
import {LogEntry} from './logEntry';
import {LogEntryData} from './logEntryData';
import {PerformanceBreakdown} from './performanceBreakdown'
import {RouteMetadataHandler} from './routeMetadataHandler';

/*
 * The full implementation class is private to the framework and excluded from the index.ts file
 */
@injectable()
export class LogEntryImpl implements LogEntry {

    private readonly _logger: Logger;
    private readonly _getPerformanceThreshold: ((op: string) => number) | null;
    private readonly _data: LogEntryData;
    private readonly _children: LogEntryData[];
    private _activeChild: LogEntryData | null;

    /*
     * A log entry is created once per API request
     */
    public constructor(apiName: string, logger: Logger, getPerformanceThreshold: ((op: string) => number) | null) {

        // Record the logger details
        this._logger = logger;
        this._getPerformanceThreshold = getPerformanceThreshold;

        // Initialise data
        this._data = new LogEntryData();
        this._data.apiName = apiName;
        this._data.hostName = os.hostname();
        this._children = [];
        this._activeChild = null;
    }

    /*
     * Start collecting data before calling the API's business logic
     */
    public start(request: Request): void {

        // Read request details
        this._data.performance.start();
        this._data.requestVerb = request.method;
        this._data.requestPath = request.originalUrl;

        // Our callers can supply a custom header so that we can keep track of who is calling each API
        const callingApplicationName = request.header('x-mycompany-api-client');
        if (callingApplicationName) {
            this._data.callingApplicationName = callingApplicationName;
        }

        // Use the correlation id from request headers or create one
        const correlationId = request.header('x-mycompany-correlation-id');
        if (correlationId) {
            this._data.correlationId = correlationId;
        } else {
            this._data.correlationId = Guid.create().toString();
        }

        // Log an optional session id if supplied
        const sessionId = request.header('x-mycompany-session-id');
        if (sessionId) {
            this._data.sessionId = sessionId;
        }
    }

    /*
     * Add identity details for secured requests
     */
    public setIdentity(claims: CoreApiClaims): void {
        this._data.clientId = claims.clientId;
        this._data.userId = claims.userId;
        this._data.userName = `${claims.givenName} ${claims.familyName}`;
    }

    /*
     * An internal method for setting the operation name
     */
    public setOperationName(name: string): void {
        this._data.operationName = name;
    }

    /*
     * Extract the operations name and resource id values from metadata
     */
    public processRoutes(request: Request, routeMetadataHandler: RouteMetadataHandler): void {

        // Calculate the operation name from request.route
        const metadata = routeMetadataHandler.getOperationRouteInfo(request);
        if (metadata) {

            // Record the operation name and also ensure that the correct performance threshold is used
            this._data.operationName = metadata.operationName;
            if (this._getPerformanceThreshold) {
                this._data.performanceThresholdMilliseconds = this._getPerformanceThreshold(this._data.operationName);
            }

            // Also log URL path segments for resource ids
            this._data.resourceId = metadata.resourceIds.join('/');
        }
    }

    /*
     * Create a child performance breakdown when requested
     */
    public createPerformanceBreakdown(name: string): PerformanceBreakdown {
        const child = this._current().performance.createChild(name);
        child.start();
        return child;
    }

    /*
     * Add error details after they have been processed by the exception handler, including denormalised fields
     */
    public setApiError(error: ApiError): void {
        this._current().errorData = error.toLogFormat(this._data.apiName);
        this._current().errorCode = error.getErrorCode();
        this._current().errorId = error.getInstanceId();
    }

    /*
     * Add error details after they have been processed by the exception handler, including denormalised fields
     */
    public setClientError(error: ClientError): void {
        this._current().errorData = error.toLogFormat();
        this._current().errorCode = error.getErrorCode();
    }

    /*
     * Enable free text to be added to production logs, though this should be avoided in most cases
     */
    public addInfo(info: any): void {
        this._current().infoData.push(info);
    }

    /*
     * Start a child operation, which gets its own JSON log output
     */
    public createChild(name: string): Disposable {

        // Fail if used incorrectly
        if (this._activeChild) {
            throw new Error('The previous child operation must be completed before a new child can be started');
        }

        // Initialise the child
        this._activeChild = new LogEntryData();
        this._activeChild.operationName = name;
        this._activeChild.performance.start();
        if (this._getPerformanceThreshold) {
            this._activeChild.performanceThresholdMilliseconds = this._getPerformanceThreshold(name);
        }

        // Add to the parent and return an object to simplify disposal
        this._children.push(this._activeChild);
        return new ChildLogEntry(this);
    }

    /*
     * Complete a child operation
     */
    public endChildOperation(): void {

        if (this._activeChild) {
            this._activeChild.performance.dispose();
            this._activeChild = null;
        }
    }

    /*
     * Finish collecting data at the end of the API request
     */
    public end(response: Response): void {

        // If an active child operation needs ending (due to exceptions) then we do it here
        this.endChildOperation();

        // Finish performance measurements
        this._data.performance.dispose();

        // Record response details
        this._data.statusCode = response.statusCode;

        // Finalise this log entry
        this._data.finalise();

        // Finalise data related to child log entries, to copy data points between parent and children
        this._children.forEach((child) => {

            child.finalise();
            child.updateFromParent(this._data);
            this._data.updateFromChild(child);
        });
    }

    /*
     * Output any child data and then the parent data
     */
    public write(): void {

        this._children.forEach((child) => this._writeDataItem(child));
        this._writeDataItem(this._data);
    }

    /*
     * Get the data to use when a child operation needs to be managed
     */
    private _current(): LogEntryData {

        if (this._activeChild) {
            return this._activeChild;
        } else {
            return this._data;
        }
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
