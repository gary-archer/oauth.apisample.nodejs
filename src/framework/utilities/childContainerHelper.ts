import {Request} from 'express';
import * as inversify from 'inversify';

/*
 * Inversify Express creates the child container per request by calling createChild on our inversify container
 * See the _createHttpContext method in this source file:
 * https://github.com/inversify/inversify-express-utils/blob/master/src/server.ts
 */
export class ChildContainerHelper {

    /*
     * Resolve the per request container that Inversify Express creates, using the Express request object
     */
    public static resolve<T>(request: Request): inversify.interfaces.Container {
        const httpContext = Reflect.getMetadata('inversify-express-utils:httpcontext', request);
        return httpContext.container;
    }
}
