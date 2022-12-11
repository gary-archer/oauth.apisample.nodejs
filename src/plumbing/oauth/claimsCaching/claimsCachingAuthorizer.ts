import {Request} from 'express';
import hasher from 'js-sha256';
import {ClaimsPrincipal} from '../../claims/claimsPrincipal';
import {CachedClaims} from '../../claims/cachedClaims';
import {ClaimsReader} from '../../claims/claimsReader';
import {CustomClaimsProvider} from '../../claims/customClaimsProvider';
import {BASETYPES} from '../../dependencies/baseTypes';
import {ChildContainerHelper} from '../../dependencies/childContainerHelper';
import {ErrorFactory} from '../../errors/errorFactory';
import {BaseAuthorizer} from '../../security/baseAuthorizer';
import {OAuthAuthenticator} from '../oauthAuthenticator';
import {ClaimsCache} from './claimsCache';
import {UserInfoClient} from './userInfoClient';

/*
 * An authorizer used when domain specific claims cannot be included in the access token
 * Our code samples use this approach when AWS Cognito is used, as a low cost cloud provider
 */
export class ClaimsCachingAuthorizer extends BaseAuthorizer {

    /*
     * Do the OAuth processing via the middleware class
     */
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
        const userInfoClient = perRequestContainer.get<UserInfoClient>(BASETYPES.UserInfoClient);

        // On every API request we validate the JWT, in a zero trust manner
        const payload = await authenticator.validateToken(accessToken);
        const baseClaims = ClaimsReader.baseClaims(payload);

        // If cached results exist for other claims then return them
        const accessTokenHash = hasher.sha256(accessToken);
        const cache = perRequestContainer.get<ClaimsCache>(BASETYPES.ClaimsCache);
        const cachedClaims = await cache.getExtraUserClaims(accessTokenHash);
        if (cachedClaims) {
            return new ClaimsPrincipal(baseClaims, cachedClaims.userInfo, cachedClaims.custom);
        }

        // In Cognito we cannot issue custom claims so the API looks them up when the access token is first received
        const userInfo = await userInfoClient.getUserInfo(accessToken);
        const customClaims = await customClaimsProvider.getFromLookup(accessToken, baseClaims, userInfo);
        const claimsToCache = new CachedClaims(userInfo, customClaims);

        // Cache the extra claims for subsequent requests with the same access token
        await cache.setExtraUserClaims(accessTokenHash, claimsToCache, payload.exp!);

        // Return the final claims
        return new ClaimsPrincipal(baseClaims, userInfo, customClaims);
    }
}
