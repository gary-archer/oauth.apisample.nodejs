import {Request} from 'express';
import {BaseHttpController} from 'inversify-express-utils';
import {FRAMEWORKTYPES, ILogEntry} from '../../framework';

/*
 * A base class to simplify logging the operation name, which Inversify Express does not expose
 * This is hacky but the least intrusive option I could find for Inversify Express
 */
export class BaseApiController extends BaseHttpController {

    /*
     * Get the current log entry and give it the calling method name
     */
    protected setOperationName(request: Request, name: string): void {

        // TODO: Avoid the need for a base controller
        const logEntry = this.httpContext.container.get<ILogEntry>(FRAMEWORKTYPES.ILogEntry);
        logEntry.setOperationName(name);
    }

    /*
     * Get the current log entry and give it the runtime path segment details
     */
    protected setResourceId(request: Request, pathSegments: string[]): void {
        const logEntry = this.httpContext.container.get<ILogEntry>(FRAMEWORKTYPES.ILogEntry);
        logEntry.setResourceId(pathSegments.join('/'));
    }
}
