import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet} from 'inversify-express-utils';
import {ClientUserInfo} from '../../logic/entities/clientUserInfo.js';
import {SampleCustomClaims} from '../../logic/entities/sampleCustomClaims.js';
import {CustomClaims} from '../../plumbing/claims/customClaims.js';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes.js';

/*
 * A controller class to return user info
 */
@controller('/userinfo')
export class UserInfoController extends BaseHttpController {

    private readonly _customClaims: SampleCustomClaims;

    public constructor(
        @inject(BASETYPES.CustomClaims) customClaims: CustomClaims) {
        super();

        this._customClaims = customClaims as SampleCustomClaims;
    }

    /*
     * Return user information not stored in the authorization server
     */
    @httpGet('')
    public getUserInfo(): ClientUserInfo {

        return {
            role: this._customClaims.userRole,
            regions: this._customClaims.userRegions,
        };
    }
}
