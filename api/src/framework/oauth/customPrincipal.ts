import {injectable} from 'inversify';
import {interfaces} from 'inversify-express-utils';

/*
 * The  inversify express interface for a custom principal
 */
// TODO: Do I need injectable?
@injectable()
export class CustomPrincipal implements interfaces.Principal {

    public details: any;

    public constructor(details: any) {
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
