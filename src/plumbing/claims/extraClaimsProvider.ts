import {Request} from 'express';
import {injectable} from 'inversify';
import {JWTPayload} from 'jose';
import {ClaimsPrincipal} from './claimsPrincipal.js';
import {ExtraClaims} from './extraClaims.js';

/*
 * Add extra claims that you cannot, or do not want to, manage in the authorization server
 */
@injectable()
export class ExtraClaimsProvider {

    /*
     * Get additional claims from the API's own database
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public async lookupExtraClaims(jwtClaims: JWTPayload, request: Request): Promise<ExtraClaims> {
        return new ExtraClaims();
    }

    /*
     * Create a claims principal that manages lookups across both token claims and extra claims
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public createClaimsPrincipal(jwtClaims: JWTPayload, extraClaims: ExtraClaims, request: Request): ClaimsPrincipal {
        return new ClaimsPrincipal(jwtClaims, extraClaims);
    }

    /*
     * Deserialize extra claims after they have been read from the cache
     */
    public deserializeFromCache(data: any): ExtraClaims {
        return ExtraClaims.importData(data);
    }
}
