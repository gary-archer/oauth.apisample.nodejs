import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet} from 'inversify-express-utils';
import {APIFRAMEWORKTYPES} from '../../framework-api-base';
import {SampleApiClaims} from '../claims/sampleApiClaims';
import {UserInfoClaims} from '../claims/userInfoClaims';

/*
 * A controller class to return user info
 */
@controller('/userclaims')
export class UserInfoController extends BaseHttpController {

    private readonly _claims: SampleApiClaims;

    public constructor(@inject(APIFRAMEWORKTYPES.CoreApiClaims) claims: SampleApiClaims) {
        super();
        this._claims = claims;
    }

    /*
     * Return any user claims needed by the UI
     */
    @httpGet('/current')
    public getUserClaims(): UserInfoClaims {

        return {
            givenName: this._claims.givenName,
            familyName: this._claims.familyName,
            email: this._claims.email,
        } as UserInfoClaims;
    }
}
