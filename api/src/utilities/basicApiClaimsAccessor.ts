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

        // The readme here has an example of injecting a trace id into a service class
        // https://github.com/weefsell/inversify-express
        if (this.httpContext && this.httpContext.user && this.httpContext.user.isAuthenticated()) {

            console.log('*** SETTING AUTHENTICATED CLAIMS');

            // This should set something that has not been set yet - like a factory
            const claims = this.httpContext.user.details as BasicApiClaims;
            console.log(claims.userId);
            console.log(claims.scopes);

            const factory = new BasicApiClaimsFactory();
            factory.setClaims(claims);
            this.bind<BasicApiClaimsFactory>('BasicApiClaims').toConstantValue(factory);
        }

        next();
    }
}
