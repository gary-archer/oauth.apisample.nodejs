import {inject} from 'inversify';
import {Controller, Get} from 'routing-controllers';
import {SampleExtraClaims} from '../../logic/claims/sampleExtraClaims.js';
import {ClientUserInfo} from '../../logic/entities/clientUserInfo.js';
import {ClaimsPrincipal} from '../../plumbing/claims/claimsPrincipal.js';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes.js';

/*
 * Return user info from the business data to the client
 * These values are separate to the core identity data returned from the OAuth user info endpoint
 */
@Controller('/userinfo')
export class UserInfoController {

    private readonly _claims: SampleExtraClaims;

    public constructor(@inject(BASETYPES.ClaimsPrincipal) claims: ClaimsPrincipal) {
        this._claims = claims.extra as SampleExtraClaims;
    }

    /*
     * Return user attributes that are not stored in the authorization server that the UI needs
     */
    @Get('')
    public getUserInfo(): ClientUserInfo {

        return {
            title: this._claims.title,
            regions: this._claims.regions,
        };
    }
}
