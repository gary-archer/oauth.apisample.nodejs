import {Request, Response} from 'express';
import {inject} from 'inversify';
import {controller, httpGet} from 'inversify-express-utils';
import {FRAMEWORKTYPES} from '../../framework';
import {BasicApiClaims} from '../entities/basicApiClaims';
import {UserInfoClaims} from '../entities/userInfoClaims';
import {BaseApiController} from './baseApiController';

/*
 * A controller class to return user info
 */
@controller('/userclaims')
export class UserInfoController extends BaseApiController {

    private readonly _claims: BasicApiClaims;

    public constructor(
        @inject(FRAMEWORKTYPES.ApiClaims) claims: BasicApiClaims) {
        super();
        this._claims = claims;
    }

    /*
     * Return any user claims needed by the UI
     */
    @httpGet('/current')
    public getUserClaims(request: Request, response: Response): UserInfoClaims {

        // Log the operation name, which the framework cannot derive
        super.setOperationName(request, this.getUserClaims.name);

        // Return user info to the UI
        return {
            givenName: this._claims.givenName,
            familyName: this._claims.familyName,
            email: this._claims.email,
        } as UserInfoClaims;
    }
}
