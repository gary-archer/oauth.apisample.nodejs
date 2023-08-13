import {injectable} from 'inversify';
import {JWTPayload} from 'jose';
import {ExtraClaims} from './extraClaims.js';

/*
 * Add extra claims that you cannot, or do not want to, manage in the authorization server
 */
@injectable()
export class ExtraClaimsProvider {

    /*
     * Look up extra claims when details are not available in the cache, such as for a new access token
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public async lookupBusinessClaims(accessToken: string, jwtClaims: JWTPayload): Promise<ExtraClaims> {
        return new ExtraClaims();
    }

    /*
     * Deserialize extra claims after they have been read from the cache
     */
    public deserializeFromCache(data: any): ExtraClaims {
        return ExtraClaims.importData(data);
    }
}
