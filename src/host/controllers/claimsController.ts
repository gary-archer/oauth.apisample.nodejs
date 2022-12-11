import {Request} from 'express';
import {inject} from 'inversify';
import {BaseHttpController, controller, httpPost} from 'inversify-express-utils';
import {SampleCustomClaimsProvider} from '../../logic/claims/sampleCustomClaimsProvider';
import {SampleCustomClaims} from '../../logic/entities/sampleCustomClaims';
import {CustomClaimsProvider} from '../../plumbing/claims/customClaimsProvider';
import {OAuthConfiguration} from '../../plumbing/configuration/oauthConfiguration';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes';
import {ErrorUtils} from '../../plumbing/errors/errorUtils';
import {ScopeVerifier} from '../../plumbing/oauth/scopeVerifier';

/*
 * A controller called during token issuing to ask the API for custom claim values
 * This requires a capability for the Authorization Server to reach out to the API
 */
@controller('/customclaims')
export class ClaimsController extends BaseHttpController {

    private readonly _configuration: OAuthConfiguration;
    private readonly _customClaimsProvider: SampleCustomClaimsProvider;

    public constructor(
        @inject(BASETYPES.OAuthConfiguration) configuration: OAuthConfiguration,
        @inject(BASETYPES.CustomClaimsProvider) customClaimsProvider: CustomClaimsProvider) {

        super();
        this._configuration = configuration;
        this._customClaimsProvider = customClaimsProvider as SampleCustomClaimsProvider;
    }

    /*
     * This is called during token issuance when the Authorization Server supports it
     * The Authorization Server will then include claims returned in the JWT access token
     */
    @httpPost('')
    public async getCustomClaims(request: Request): Promise<any> {

        // The endpoint is only enabled when this claims strategy is used
        if (this._configuration.claimsStrategy !== 'jwt') {
            ScopeVerifier.deny();
        }

        // Get identity attributes about the user
        const subject = request.body?.subject;
        const email   = request.body?.email;

        if (!subject) {
            throw ErrorUtils.fromMissingClaim('subject');
        }
        if (!email) {
            throw ErrorUtils.fromMissingClaim('email');
        }

        // Return domain specific attributes about the user
        const customClaims = await this._customClaimsProvider.issue(subject, email) as SampleCustomClaims;
        return {
            user_id: customClaims.userId,
            user_role: customClaims.userRole,
            user_regions: customClaims.userRegions,
        };
    }
}
