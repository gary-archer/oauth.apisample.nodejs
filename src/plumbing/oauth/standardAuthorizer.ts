import {Request} from 'express';
import {ClaimsPrincipal} from '../claims/claimsPrincipal.js';
import {ClaimsReader} from '../claims/claimsReader.js';
import {CustomClaimsProvider} from '../claims/customClaimsProvider.js';
import {BASETYPES} from '../dependencies/baseTypes.js';
import {ChildContainerHelper} from '../dependencies/childContainerHelper.js';
import {ErrorFactory} from '../errors/errorFactory.js';
import {BaseAuthorizer} from '../security/baseAuthorizer.js';
import {OAuthAuthenticator} from './oauthAuthenticator.js';

/*
 * An authorizer that relies on all domain specific claims being included in the JWT
 * See this API's ClaimsController class for details on how the claims are issued
 */
export class StandardAuthorizer extends BaseAuthorizer {

    /*
     * Do the OAuth processing via the middleware class
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    protected async execute(
        request: Request,
        customClaimsProvider: CustomClaimsProvider): Promise<ClaimsPrincipal> {

        // First read the access token
        const accessToken = super.readAccessToken(request);
        if (!accessToken) {
            throw ErrorFactory.createClient401Error('No access token was supplied in the bearer header');
        }

        // Get per request dependencies
        const perRequestContainer = ChildContainerHelper.resolve(request);
        const authenticator = perRequestContainer.get<OAuthAuthenticator>(BASETYPES.OAuthAuthenticator);

        // On every API request we validate the JWT, in a zero trust manner
        const payload = await authenticator.validateToken(accessToken);

        // Then read all claims from the token
        const baseClaims = ClaimsReader.baseClaims(payload);
        const userInfo = ClaimsReader.userInfoClaims(payload);
        const customClaims = customClaimsProvider.getFromPayload(payload);
        return new ClaimsPrincipal(baseClaims, userInfo, customClaims);
    }
}
