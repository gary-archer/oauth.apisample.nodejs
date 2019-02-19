import {BaseHttpController, controller, httpGet} from 'inversify-express-utils';
import {BasicApiClaims} from '../entities/basicApiClaims';
import {UserInfoClaims} from '../entities/userInfoClaims';

/*
 * A controller class to return user info
 */
@controller('/userclaims')
export class UserInfoController extends BaseHttpController {

    /*
     * Return user claims
     */
    @httpGet('/current')
    private get(): UserInfoClaims {

        // TODO: Use a class and deal with serialization of private fields
        const claims = this.httpContext.user.details as BasicApiClaims;
        return {
            givenName: claims.givenName,
            familyName: claims.familyName,
            email: claims.email,
        } as UserInfoClaims;
    }
}
