import {JWTPayload} from 'jose/types';
import {BaseClaims} from './baseClaims';
import {CustomClaims} from './customClaims';
import {UserInfoClaims} from './userInfoClaims';

/*
 * A class to deal with domain specific claims, needed for business authorization
 */
export class CustomClaimsProvider {

    /*
     * When using the StandardAuthorizer, this is called at the time of token issuance
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public async issue(subject: any): Promise<CustomClaims> {
        return new CustomClaims();
    }

    /*
     * When using the StandardAuthorizer, this is called to read claims from the access token
     */
    public async getFromPayload(payload: JWTPayload): Promise<CustomClaims> {
        return new CustomClaims();
    }

    /*
     * When using the ClaimsCachingAuthorizer, this is called to get extra claims when the token is first received
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public async getFromLookup(
        accessToken: string,
        token: BaseClaims,
        userInfo: UserInfoClaims): Promise<CustomClaims> {

        return new CustomClaims();
    }

    /*
     * This can be overridden by derived classes
     */
    public deserialize(data: any): CustomClaims {
        return CustomClaims.importData(data);
    }
}
