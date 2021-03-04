import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet} from 'inversify-express-utils';
import {UserInfoClaims} from '../../plumbing/claims/userInfoClaims';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes';

/*
 * A controller class to return user info
 */
@controller('/userclaims')
export class UserInfoController extends BaseHttpController {

    private readonly _claims: UserInfoClaims;

    public constructor(@inject(BASETYPES.UserInfoClaims) claims: UserInfoClaims) {
        super();
        this._claims = claims;
    }

    /*
     * Return user claims needed by the UI
     */
    @httpGet('/current')
    public getUserClaims(): any {

        return {
            givenName: this._claims.givenName,
            familyName: this._claims.familyName,
        };
    }
}
