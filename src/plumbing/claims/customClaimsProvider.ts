import {BaseClaims} from './baseClaims';
import {CustomClaims} from './customClaims';
import {UserInfoClaims} from './userInfoClaims';

/*
 * A class to deal with domain specific claims, needed for business authorization
 */
export class CustomClaimsProvider {

    /*
     * This can be overridden by derived classes and is used at the time of token issuance
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public async issue(subject: any): Promise<CustomClaims> {
        return new CustomClaims();
    }

    /*
     * Alternatively, this can be overridden by derived classes to get custom claims when a token is first received
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public async get(accessToken: string, token: BaseClaims, userInfo: UserInfoClaims): Promise<CustomClaims> {
        return new CustomClaims();
    }

    /*
     * This can be overridden by derived classes
     */
    public deserialize(data: any): CustomClaims {
        return CustomClaims.importData(data);
    }
}
