import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet} from 'inversify-express-utils';
import {SampleExtraClaims} from '../../logic/claims/sampleExtraClaims.js';
import {ClientUserInfo} from '../../logic/entities/clientUserInfo.js';
import {ClaimsPrincipal} from '../../plumbing/claims/claimsPrincipal.js';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes.js';

/*
 * A controller class to return user info
 */
@controller('/userinfo')
export class UserInfoController extends BaseHttpController {

    private readonly _claims: SampleExtraClaims;

    public constructor(@inject(BASETYPES.ClaimsPrincipal) claims: ClaimsPrincipal) {

        super();
        this._claims = claims.extra as SampleExtraClaims;
    }

    /*
     * Return user information not stored in the authorization server
     */
    @httpGet('')
    public getUserInfo(): ClientUserInfo {

        return {
            role: this._claims.role,
            regions: this._claims.regions,
        };
    }
}
