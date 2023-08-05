import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet} from 'inversify-express-utils';
import {ClientUserInfo} from '../../logic/entities/clientUserInfo.js';
import {SampleCustomClaims} from '../../logic/entities/sampleCustomClaims.js';
import {ClaimsPrincipal} from '../../plumbing/claims/claimsPrincipal.js';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes.js';

/*
 * A controller class to return user info
 */
@controller('/userinfo')
export class UserInfoController extends BaseHttpController {

    private readonly _customClaims: SampleCustomClaims;

    public constructor(@inject(BASETYPES.ClaimsPrincipal) claims: ClaimsPrincipal) {

        super();
        this._customClaims = claims.custom as SampleCustomClaims;
    }

    /*
     * Return user information not stored in the authorization server
     */
    @httpGet('')
    public getUserInfo(): ClientUserInfo {

        return {
            role: this._customClaims.role,
            regions: this._customClaims.regions,
        };
    }
}
