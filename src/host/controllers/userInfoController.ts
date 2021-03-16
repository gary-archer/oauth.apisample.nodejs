import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet} from 'inversify-express-utils';
import {TokenClaims} from '../../plumbing/claims/tokenClaims';
import {UserInfoClaims} from '../../plumbing/claims/userInfoClaims';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes';

/*
 * A controller class to return user info
 */
@controller('/userinfo')
export class UserInfoController extends BaseHttpController {

    private readonly _tokenClaims: TokenClaims;
    private readonly _userInfoClaims: UserInfoClaims;

    public constructor(
        @inject(BASETYPES.TokenClaims) tokenClaims: TokenClaims,
        @inject(BASETYPES.UserInfoClaims) userInfoClaims: UserInfoClaims) {
        super();

        this._tokenClaims = tokenClaims;
        this._userInfoClaims = userInfoClaims;
    }

    /*
     * Return user info needed by the UI
     */
    @httpGet('')
    public getUserInfo(): any {

        // First check scopes
        this._tokenClaims.verifyScope('profile');

        // Return OAuth profile data for display in the UI
        return {
            givenName: this._userInfoClaims.givenName,
            familyName: this._userInfoClaims.familyName,
        };
    }
}
