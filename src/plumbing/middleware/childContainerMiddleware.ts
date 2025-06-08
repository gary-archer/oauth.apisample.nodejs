import {NextFunction, Request, Response} from 'express';
import {Container} from 'inversify';

/*
 * Creates a child container for each request, to contain request-scoped objects
 */
export class ChildContainerMiddleware {

    private readonly parentContainer: Container;

    public constructor(parentCntainer: Container) {
        this.parentContainer = parentCntainer;
        this.setupCallbacks();
    }

    public execute(request: Request, response: Response, next: NextFunction): void {

        response.locals.container = new Container({ parent: this.parentContainer });
        response.on('finish', () => {
            delete response.locals.container;
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
