import {NextFunction, Request, Response} from 'express';
import {Container} from 'inversify';

/*
 * Creates a child container for each request, to contain request-scoped objects
 */
export class ChildContainerMiddleware {

    private readonly _container: Container;
    
    public constructor(container: Container) {
        this._container = container;
    }

    public execute(request: Request, response: Response, next: NextFunction): void {

        response.locals.container = this._container.createChild();
        response.on('finish', () => {
            delete response.locals.container;
        });
    }
}
