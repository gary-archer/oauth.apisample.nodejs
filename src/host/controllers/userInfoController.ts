import {inject} from 'inversify';
import {SampleExtraClaims} from '../../logic/claims/sampleExtraClaims.js';
import {ClientUserInfo} from '../../logic/entities/clientUserInfo.js';
import {ClaimsPrincipal} from '../../plumbing/claims/claimsPrincipal.js';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes.js';
import {Controller} from '../routes/controllerDecorator.js';
import {Get} from '../routes/routerDecorator.js';

/*
 * Return user info from the business data to the client
 * These values are separate to the core identity data returned from the OAuth user info endpoint
 */
@Controller('/investments/userinfo')
export class UserInfoController {

    private readonly claims: SampleExtraClaims;

    public constructor(@inject(BASETYPES.ClaimsPrincipal) claims: ClaimsPrincipal) {
        this.claims = claims.getExtra() as SampleExtraClaims;
        this.setupCallbacks();
    }

    /*
     * Return user attributes that are not stored in the authorization server that the UI needs
     */
    @Get('')
    public getUserInfo(): ClientUserInfo {

        return {
            title: this.claims.getTitle(),
            regions: this.claims.getRegions(),
        };
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private setupCallbacks(): void {
        this.getUserInfo = this.getUserInfo.bind(this);
    }
}
