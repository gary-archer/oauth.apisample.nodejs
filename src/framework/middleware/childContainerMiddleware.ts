import {NextFunction, Request, Response} from 'express';
import {Container} from 'inversify';
import {ChildContainerHelper} from '../utilities/childContainerHelper';

/*
 * A simple middleware to create a child container at the start of an API request
 */
export class ChildContainerMiddleware {

    private readonly _container: Container;

    public constructor(container: Container) {
        this._container = container;
        this._setupCallbacks();
    }

    /*
     * Create the child container and store it in the Express request object
     */
    public create(request: Request, response: Response, next: NextFunction): void {
        ChildContainerHelper.create(this._container, request);
        next();
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private _setupCallbacks(): void {
        this.create = this.create.bind(this);
    }
}
