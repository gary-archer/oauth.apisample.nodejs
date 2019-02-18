import {BaseHttpController, controller, httpGet} from 'inversify-express-utils';
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

        // TODO: Inject claims using HTTP context
        return {
            givenName: 'Gary',
            familyName: 'Archer',
            email: 'garyarcher36@gmail.com',
        } as UserInfoClaims;
    }
}
