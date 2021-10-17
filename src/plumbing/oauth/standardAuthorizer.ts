import {Request} from 'express';
import {ApiClaims} from '../claims/apiClaims';
import {ClaimsReader} from '../claims/claimsReader';
import {CustomClaimsProvider} from '../claims/customClaimsProvider';
import {BASETYPES} from '../dependencies/baseTypes';
import {ChildContainerHelper} from '../dependencies/childContainerHelper';
import {ErrorFactory} from '../errors/errorFactory';
import {BaseAuthorizer} from '../security/baseAuthorizer';
import {OAuthAuthenticator} from './oauthAuthenticator';

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
        customClaimsProvider: CustomClaimsProvider): Promise<ApiClaims> {

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
        const customClaims = await customClaimsProvider.get(accessToken,baseClaims, userInfo);
        return new ApiClaims(baseClaims, userInfo, customClaims);
    }
}
