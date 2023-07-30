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
    private readonly _userInfoClaims: UserInfoClaims;
    private readonly _customClaims: SampleCustomClaims;

    public constructor(
        @inject(BASETYPES.BaseClaims) baseClaims: BaseClaims,
        @inject(BASETYPES.UserInfoClaims) userInfoClaims: UserInfoClaims,
        @inject(BASETYPES.CustomClaims) customClaims: CustomClaims) {
        super();

        this._baseClaims = baseClaims;
        this._userInfoClaims = userInfoClaims;
        this._customClaims = customClaims as SampleCustomClaims;
    }

    /*
     * Return user info needed by the UI
     */
    @httpGet('')
    public getUserInfo(): any {

        // First check scopes
        ScopeVerifier.enforce(this._baseClaims.scopes, 'profile');

        // Return a payload with whatever the UI needs
        return {
            givenName: this._userInfoClaims.givenName,
            familyName: this._userInfoClaims.familyName,
            role: this._customClaims.userRole,
            regions: this._customClaims.userRegions,
        };
    }
}
