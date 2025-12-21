import {NextFunction, Request, Response} from 'express';
import {BaseErrorCodes} from '../errors/baseErrorCodes.js';
import {ErrorFactory} from '../errors/errorFactory.js';

/*
 * A class to process custom headers to enable testers to control non functional behaviour
 */
export class CustomHeaderMiddleware {

    private readonly apiName: string;

    public constructor(apiName: string) {
        this.apiName = apiName.toLowerCase();
        this.setupCallbacks();
    }

    /*
     * Enable testers to select an API to break as part of non functional testing
     * This can be especially useful when there are many APIs and they call each other
     */
    public execute(request: Request, response: Response, next: NextFunction): void {

        const apiToBreak = request.header('exception-for');
        if (apiToBreak) {
            if (apiToBreak.toLowerCase() === this.apiName.toLowerCase()) {

                throw ErrorFactory.createServerError(
                    BaseErrorCodes.exceptionSimulation,
                    'An unexpected exception occurred in the API');
            }
        }

        next();
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private setupCallbacks(): void {
        this.execute = this.execute.bind(this);
    }
}
