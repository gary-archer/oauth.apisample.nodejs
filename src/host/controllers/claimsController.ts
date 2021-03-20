import {inject} from 'inversify';
import {BaseHttpController, controller, httpGet, requestParam} from 'inversify-express-utils';
import {CustomClaimsProvider} from '../../plumbing/claims/customClaimsProvider';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes';
import {SampleCustomClaimsProvider} from '../claims/sampleCustomClaimsProvider';

/*
 * A controller called during token issuing to ask the API for custom claim values
 * This requires a capability for the Authorization Server to reach out to the API
 */
@controller('/customclaims')
export class ClaimsController extends BaseHttpController {

    private readonly _claimsProvider: SampleCustomClaimsProvider;

    public constructor(@inject(BASETYPES.CustomClaimsProvider) claimsProvider: CustomClaimsProvider) {
        super();
        this._claimsProvider = claimsProvider as SampleCustomClaimsProvider;
    }

    /*
     * This is called during token issuance by the Authorization Server when using the StandardAuthorizer
     * The custom claims are then included in the access token
     */
    @httpGet('/:subject')
    public async getCustomClaims(@requestParam('subject') subject: string): Promise<any> {

        const customClaims = await this._claimsProvider.supplyCustomClaimsFromSubject(subject);

        return {
            user_database_id: customClaims.userDatabaseId,
            user_role: customClaims.userRole,
            user_regions: customClaims.regionsCovered,
        };
    }
}
