import {createHash} from 'crypto';
import {Request} from 'express';
import {ClaimsPrincipal} from '../claims/claimsPrincipal.js';
import {CachedClaims} from '../claims/cachedClaims.js';
import {ClaimsCache} from '../claims/claimsCache.js';
import {ClaimsReader} from '../claims/claimsReader.js';
import {CustomClaimsProvider} from '../claims/customClaimsProvider.js';
import {BASETYPES} from '../dependencies/baseTypes.js';
import {ChildContainerHelper} from '../dependencies/childContainerHelper.js';
import {ErrorFactory} from '../errors/errorFactory.js';
import {BaseAuthorizer} from '../security/baseAuthorizer.js';
import {OAuthAuthenticator} from './oauthAuthenticator.js';

/*
 * An authorizer used when domain specific claims cannot be included in the access token
 * Our code samples use this approach when AWS Cognito is usFed, as a low cost cloud provider
 */
export class OAuthAuthorizer extends BaseAuthorizer {

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

        // On every API request we validate the JWT, in a zero trust manner
        const payload = await authenticator.validateToken(accessToken);
        const baseClaims = ClaimsReader.baseClaims(payload);

        // If cached results exist for other claims then return them
        const accessTokenHash = createHash('sha256').update(accessToken).digest('hex');
        const cache = perRequestContainer.get<ClaimsCache>(BASETYPES.ClaimsCache);
        const cachedClaims = await cache.getExtraUserClaims(accessTokenHash);
        if (cachedClaims) {
            return new ClaimsPrincipal(baseClaims, cachedClaims.custom);
        }

        // In Cognito we cannot issue custom claims so the API looks them up when the access token is first received
        const customClaims = await customClaimsProvider.getFromLookup(accessToken, baseClaims);
        const claimsToCache = new CachedClaims(customClaims);

        // Cache the extra claims for subsequent requests with the same access token
        await cache.setExtraUserClaims(accessTokenHash, claimsToCache, payload.exp!);

        // Return the final claims
        return new ClaimsPrincipal(baseClaims, customClaims);
    }
}
