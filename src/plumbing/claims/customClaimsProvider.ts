import {BaseClaims} from './baseClaims.js';
import {CustomClaims} from './customClaims.js';

/*
 * A class to deal with domain specific claims, needed for business authorization
 */
export class CustomClaimsProvider {

    /*
     * When using the ClaimsCachingAuthorizer, this is called to get extra claims when the token is first received
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public async getFromLookup(accessToken: string, token: BaseClaims): Promise<CustomClaims> {
        return new CustomClaims();
    }

    /*
     * This can be overridden by derived classes
     */
    public deserialize(data: any): CustomClaims {
        return CustomClaims.importData(data);
    }
}
