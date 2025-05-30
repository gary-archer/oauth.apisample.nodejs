import {createHash} from 'crypto';
import {Request, Response} from 'express';
import {inject, injectable} from 'inversify';
import {ClaimsCache} from '../claims/claimsCache.js';
import {ClaimsPrincipal} from '../claims/claimsPrincipal.js';
import {ExtraClaimsProvider} from '../claims/extraClaimsProvider.js';
import {BASETYPES} from '../dependencies/baseTypes.js';
import {ErrorFactory} from '../errors/errorFactory.js';
import {AccessTokenValidator} from './accessTokenValidator.js';
import {BearerToken} from './bearerToken.js';

/*
 * A class to create the claims principal at the start of every secured request
 */
@injectable()
export class OAuthFilter {

    private readonly cache: ClaimsCache;
    private readonly accessTokenValidator: AccessTokenValidator;
    private readonly extraClaimsProvider: ExtraClaimsProvider;

    public constructor(
        @inject(BASETYPES.ClaimsCache) cache: ClaimsCache,
        @inject(BASETYPES.AccessTokenValidator) accessTokenValidator: AccessTokenValidator,
        @inject(BASETYPES.ExtraClaimsProvider) extraClaimsProvider: ExtraClaimsProvider) {

        this.cache = cache;
        this.accessTokenValidator = accessTokenValidator;
        this.extraClaimsProvider = extraClaimsProvider;
    }

    /*
     * Validate the OAuth access token and then look up other claims
     */
    public async execute(request: Request, response: Response): Promise<ClaimsPrincipal> {

        // First read the access token
        const accessToken = BearerToken.read(request);
        if (!accessToken) {
            throw ErrorFactory.createClient401Error('No access token was supplied in the bearer header');
        }

        // On every API request we validate the JWT, in a zero trust manner
        const jwtClaims = await this.accessTokenValidator.execute(accessToken);

        // If cached results already exist for this token then return them immediately
        const accessTokenHash = createHash('sha256').update(accessToken).digest('hex');
        let extraClaims = this.cache.getExtraUserClaims(accessTokenHash);
        if (extraClaims) {
            return new ClaimsPrincipal(jwtClaims, extraClaims);
        }

        // Look up extra claims not in the JWT access token
        extraClaims = await this.extraClaimsProvider.lookupExtraClaims(jwtClaims, response);

        // Cache the extra claims for subsequent requests with the same access token
        this.cache.setExtraUserClaims(accessTokenHash, extraClaims, jwtClaims.exp || 0);

        // Return the final claims
        return new ClaimsPrincipal(jwtClaims, extraClaims);
    }
}
