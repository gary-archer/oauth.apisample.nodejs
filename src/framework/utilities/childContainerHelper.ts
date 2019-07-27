import {Request} from 'express';
import {Container} from 'inversify';

/*
 * A simple helper to manage the child container per request
 */
export class ChildContainerHelper {

    /*
     * Store the per request container in the Express request object, as for other frameworks
     */
    public static create(parent: Container, request: Request): void {
        (request as any).container = parent.createChild();
    }

    /*
     * Store the per request container in the Express request object, as for other frameworks
     */
    public static resolve(request: Request): Container {
        return (request as any).container;
    }
}
