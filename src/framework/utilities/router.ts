import {NextFunction, Request, RequestHandler, Response} from 'express';
import {Container} from 'inversify';
import {FRAMEWORKTYPES} from '../configuration/frameworkTypes';
import {UnhandledExceptionHandler} from '../errors/unhandledExceptionHandler';
import {ChildContainerHelper} from './childContainerHelper';

/*
 * A helper class to autowire controllers and then return request handlers
 */
export class Router {

    private readonly _exceptionHandler: UnhandledExceptionHandler;

    public constructor(container: Container) {
        this._exceptionHandler = container.get<UnhandledExceptionHandler>(FRAMEWORKTYPES.UnhandledExceptionHandler);
    }

    /*
     * Autowire the controller from the child container and then execute the method
     */
    public getHandler<T>(
        serviceIdenfifier: symbol,
        operation: (c: T) => (r1: Request, r2: Response) => void): RequestHandler {

        return (request: Request, response: Response) => {

            // Get the container for this request
            const requestContainer = ChildContainerHelper.resolve(request);

            // Auto wire the controller from the child container
            // This allows us to inject the claims and log entry for the request
            const controller = requestContainer.get<T>(serviceIdenfifier);

            // Execute the callback method on the controller
            operation(controller)(request, response);
        };
    }

    /*
     * Autowire the controller from the child container and then execute the method
     * Also catch unhandled promise exceptions if the operation throws an exception
     */
    public getAsyncHandler<T>(
        serviceIdenfifier: symbol,
        operation: (c: T) => (r1: Request, r2: Response) => Promise<void>): RequestHandler {

        return async (request: Request, response: Response, next: NextFunction) => {

            try {
                // Get the container for this request
                const requestContainer = ChildContainerHelper.resolve(request);

                // Auto wire the controller from the child container
                // This allows us to inject the claims and log entry for the request
                const controller = requestContainer.get<T>(serviceIdenfifier);

                // Execute the operation and catch unhandled promise exceptions
                await operation(controller)(request, response);

            } catch (e) {

                // We must handle unpromised exceptions here
                this._exceptionHandler.handleException(e, request, response, next);
            }
        };
    }
}
