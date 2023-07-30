import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet} from 'inversify-express-utils';
import {SampleCustomClaims} from '../../logic/entities/sampleCustomClaims.js';
import {BaseClaims} from '../../plumbing/claims/baseClaims.js';
import {CustomClaims} from '../../plumbing/claims/customClaims.js';
import {UserInfoClaims} from '../../plumbing/claims/userInfoClaims.js';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes.js';
import {ScopeVerifier} from '../../plumbing/oauth/scopeVerifier.js';

/*
 * A controller class to return user info
 */
@controller('/userinfo')
export class UserInfoController extends BaseHttpController {

    private readonly _baseClaims: BaseClaims;
    private readonly _customClaims: SampleCustomClaims;

    public constructor(
        @inject(BASETYPES.BaseClaims) baseClaims: BaseClaims,
        @inject(BASETYPES.CustomClaims) customClaims: CustomClaims) {
        super();

        this._baseClaims = baseClaims;
        this._customClaims = customClaims as SampleCustomClaims;
    }

    /*
     * Return user information not stored in the authorization server
     */
    @httpGet('')
    public getUserInfo(): any {

        ScopeVerifier.enforce(this._baseClaims.scopes, 'profile');

        return {
            role: this._customClaims.userRole,
            regions: this._customClaims.userRegions,
        };
    }
}
