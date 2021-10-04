import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet, requestParam} from 'inversify-express-utils';
import {SampleCustomClaims} from '../../logic/entities/sampleCustomClaims';
import {CustomClaimsProvider} from '../../plumbing/claims/customClaimsProvider';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes';
import {SampleCustomClaimsProvider} from '../claims/sampleCustomClaimsProvider';

/*
 * A controller called during token issuing to ask the API for custom claim values
 * This requires a capability for the Authorization Server to reach out to the API
 */
@controller('/customclaims')
export class ClaimsController extends BaseHttpController {

    private readonly _customClaimsProvider: SampleCustomClaimsProvider;

    public constructor(@inject(BASETYPES.CustomClaimsProvider) customClaimsProvider: CustomClaimsProvider) {
        super();
        this._customClaimsProvider = customClaimsProvider as SampleCustomClaimsProvider;
    }

    /*
     * This is called during token issuance by the Authorization Server when using the StandardAuthorizer
     * The custom claims are then included in the access token
     */
    @httpGet('/:subject')
    public async getCustomClaims(@requestParam('subject') subject: string): Promise<any> {

        const customClaims = await this._customClaimsProvider.issue(subject) as SampleCustomClaims;

        return {
            user_id: customClaims.userId,
            user_role: customClaims.userRole,
            user_regions: customClaims.userRegions,
        };
    }
}
