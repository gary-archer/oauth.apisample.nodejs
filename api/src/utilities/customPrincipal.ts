import {injectable} from 'inversify';
import {interfaces} from 'inversify-express-utils';
import {BasicApiClaims} from '../entities/BasicApiClaims';

/*
 * Implement the inversify express interface to return our claims
 */
@injectable()
export class CustomPrincipal implements interfaces.Principal {

    public details: any;

    public constructor(details: BasicApiClaims) {
        this.details = details;
    }

    public isAuthenticated(): Promise<boolean> {
        return Promise.resolve(true);
    }
    public isResourceOwner(resourceId: any): Promise<boolean> {
        return Promise.resolve(false);
    }
    public isInRole(role: string): Promise<boolean> {
        return Promise.resolve(false);
    }
}
