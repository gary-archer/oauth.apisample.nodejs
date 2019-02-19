import {NextFunction, Request, Response} from 'express';
import {injectable} from 'inversify';
import {BaseMiddleware} from 'inversify-express-utils';
import {BasicApiClaims} from '../entities/BasicApiClaims';
import {BasicApiClaimsFactory} from './basicApiClaimsFactory';

/*
 * A helper object to allow us to inject our claims
 */
@injectable()
export class BasicApiClaimsAccessor extends BaseMiddleware {

    public constructor() {
        super();
    }

    public handler(req: Request, res: Response, next: NextFunction): void {

        // TODO: This is messy and needs to be made more intuitive next

        if (this.httpContext && this.httpContext.user && this.httpContext.user.isAuthenticated()) {

            const claims = this.httpContext.user.details as BasicApiClaims;
            const factory = new BasicApiClaimsFactory();
            factory.setClaims(claims);
            this.bind<BasicApiClaimsFactory>('BasicApiClaimsFactory').toConstantValue(factory);
        }

        next();
    }
}
