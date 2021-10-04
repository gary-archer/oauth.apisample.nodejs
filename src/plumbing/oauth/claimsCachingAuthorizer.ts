import {Request} from 'express';
import hasher from 'js-sha256';
import {ApiClaims} from '../claims/apiClaims';
import {CachedClaims} from '../claims/cachedClaims';
import {ClaimsCache} from '../claims/claimsCache';
import {ClaimsReader} from '../claims/claimsReader';
import {CustomClaimsProvider} from '../claims/customClaimsProvider';
import {BASETYPES} from '../dependencies/baseTypes';
import {ChildContainerHelper} from '../dependencies/childContainerHelper';
import {ErrorFactory} from '../errors/errorFactory';
import {BaseAuthorizer} from '../security/baseAuthorizer';
import {OAuthAuthenticator} from './oauthAuthenticator';

/*
 * An authorizer that manages claims in an extensible manner, with the ability to use claims from the API's own data
 */
export class ClaimsCachingAuthorizer extends BaseAuthorizer {

    /*
     * Do the OAuth processing via the middleware class
     */
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
        const tokenClaims = ClaimsReader.baseClaims(payload);

        // If cached results exist for other claims then return them
        const accessTokenHash = hasher.sha256(accessToken);
        const cache = perRequestContainer.get<ClaimsCache>(BASETYPES.ClaimsCache);
        const cachedClaims = await cache.getExtraUserClaims(accessTokenHash);
        if (cachedClaims) {
            return new ApiClaims(tokenClaims, cachedClaims.userInfo, cachedClaims.custom);
        }

        // In Cognito we cannot issue custom claims so the API looks them up when the access token is first received
        const userInfo = await authenticator.getUserInfo(accessToken);
        const customClaims = await customClaimsProvider.get(accessToken, tokenClaims, userInfo);
        const claimsToCache = new CachedClaims(userInfo, customClaims);

        // Cache the extra claims for subsequent requests with the same access token
        await cache.setExtraUserClaims(accessTokenHash, claimsToCache, payload.exp!);

        // Return the final claims
        return new ApiClaims(tokenClaims, userInfo, customClaims);
    }
}
