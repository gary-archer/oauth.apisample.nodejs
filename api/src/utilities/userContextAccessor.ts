import {NextFunction, Request, Response} from 'express';
import {injectable} from 'inversify';
import {BaseMiddleware} from 'inversify-express-utils';
import {BasicApiClaims} from '../entities/basicApiClaims';
import {TYPES} from './types';

/*
 * A helper object to allow us to inject user context into our repository class
 * 
 */
@injectable()
export class UserContextAccessor extends BaseMiddleware {

    public constructor() {
        super();
    }

    /*
     * This method only fires when authentication succeeds
     * We then rebind injected claims to those that were calculated
     */
    public handler(req: Request, res: Response, next: NextFunction): void {

        const claims = this.httpContext.user.details as BasicApiClaims;
        this.bind<BasicApiClaims>(TYPES.BasicApiClaims).toConstantValue(claims);
        next();
    }
}
