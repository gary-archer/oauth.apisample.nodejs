import {randomUUID} from 'crypto';
import {Request, Response} from 'express';
import {injectable} from 'inversify';
import os from 'os';
import {ClientError} from '../errors/clientError.js';
import {ServerError} from '../errors/serverError.js';
import {RouteLogInfoHandler} from '../routes/routeLogInfoHandler.js';
import {IdentityLogData} from './identityLogData.js';
import {LogEntryData} from './logEntryData.js';
import {LogEntry} from './logEntry.js';
import {PerformanceBreakdown} from './performanceBreakdown.js';

/*
 * A log entry collects data during an API request and outputs it at the end
 */
@injectable()
export class LogEntryImpl implements LogEntry {

    private readonly data: LogEntryData;

    /*
     * Initialize log data
     */
    public constructor(apiName: string, performanceThresholdMilliseconds: number) {

        this.data = new LogEntryData();
        this.data.apiName = apiName;
        this.data.hostName = os.hostname();
        this.data.performanceThresholdMilliseconds = performanceThresholdMilliseconds;
    }

    /*
     * Start collecting data before calling the API's business logic
     */
    public start(request: Request, routeLogInfoHandler: RouteLogInfoHandler): void {

        // Read request details
        this.data.performance.start();
        this.data.method = request.method;
        this.data.path = request.originalUrl;

        // Use the correlation id from request headers or create one
        const correlationId = request.header('correlation-id');
        this.data.correlationId = correlationId ? correlationId : randomUUID();

        // Also include route information in logs
        const routeLogInfo = routeLogInfoHandler.getLogInfo(request);
        if (routeLogInfo) {
            this.data.operationName = routeLogInfo.operationName;
            this.data.resourceId = routeLogInfo.resourceIds.join('/');
        }
    }

    /*
     * Audit identity details
     */
    public setIdentity(data: IdentityLogData): void {
        this.data.userId = data.userId;
        this.data.clientId = data.clientId;
        this.data.sessionId = data.sessionId;
        this.data.scope = data.scope;
        this.data.claims = data.claims;
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
        this.data.performance[Symbol.dispose]();

        // Record response details
        this.data.statusCode = response.statusCode;

        // Finalise this log entry
        this.data.finalise();
    }

    /*
     * Get the request data to output to logs for a support team
     */
    public getRequestLog(): any {
        return this.data.toRequestLog();
    }

    /*
     * Get the audit data to output to logs for a security team
     */
    public getAuditLog(): any {
        return this.data.toAuditLog();
    }
}
