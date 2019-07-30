import {Request} from 'express';
import {BaseHttpController} from 'inversify-express-utils';
import {FRAMEWORKPUBLICTYPES, ILogEntry} from '../../framework';

/*
 * A base class to simplify logging details that we cannot calculate in the framework
 */
export class BaseApiController extends BaseHttpController {

    /*
     * Get the current log entry and give it the calling method name
     */
    protected setOperationName(request: Request, name: string): void {
        const logEntry = this.httpContext.container.get<ILogEntry>(FRAMEWORKPUBLICTYPES.ILogEntry);
        logEntry.setOperationName(name);
    }

    /*
     * Get the current log entry and give it the runtime path segment details
     */
    protected setResourceId(request: Request, pathSegments: string[]): void {
        const logEntry = this.httpContext.container.get<ILogEntry>(FRAMEWORKPUBLICTYPES.ILogEntry);
        logEntry.setResourceId(pathSegments.join('/'));
    }
}
