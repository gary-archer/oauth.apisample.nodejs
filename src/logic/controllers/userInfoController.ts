import {Controller, Get, Path, Route} from 'tsoa';
import {BasicApiClaims} from '../entities/basicApiClaims';
import {UserInfoClaims} from '../entities/userInfoClaims';

/*
 * A controller class to return user info
 */
@Route('/userclaims')
export class UserInfoController extends Controller {

    private readonly _claims: BasicApiClaims;

    public constructor(claims: BasicApiClaims) {
        super();
        this._claims = claims;
    }

    /*
     * Return any user claims needed by the UI
     */
    @Get('/current')
    public getUserClaims(): UserInfoClaims {

        return {
            givenName: this._claims.givenName,
            familyName: this._claims.familyName,
            email: this._claims.email,
        } as UserInfoClaims;
    }
}
