import {NextFunction, Request, Response} from 'express';
import {Container, injectable} from 'inversify';
import {BaseMiddleware} from 'inversify-express-utils';
import {BasicApiClaims} from '../entities/BasicApiClaims';

/*
 * A helper object to allow us to inject our claims
 */
@injectable()
export class BasicApiClaimsAccessor extends BaseMiddleware {

    private _container: Container;

    public constructor(container: Container) {
        super();
        this._container = container;
    }

    public handler(req: Request, res: Response, next: NextFunction) {

        console.log('*** IN HANDLER');
        if (this.httpContext.user.isAuthenticated()) {

            const claims = this.httpContext.user.details as BasicApiClaims;
            if (!this._container.isBound('HttpContext')) {
                console.log('*** NOT BOUND');
                this._container.bind<BasicApiClaims>('BasicApiClaims').toConstantValue(claims);
            } else {
                console.log('*** REBINDING');
                this._container.rebind<BasicApiClaims>('BasicApiClaims').toConstantValue(claims);
            }
        }

        next();
    }
}
