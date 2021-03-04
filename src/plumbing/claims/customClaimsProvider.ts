import {TokenClaims} from './tokenClaims';
import {CustomClaims} from './customClaims';
import {UserInfoClaims} from './userInfoClaims';

/*
 * Concrete APIs can override this class to add custom claims to the cache
 * @typescript-eslint/no-unused-vars:disable
 */
export class CustomClaimsProvider {

    /* eslint-disable @typescript-eslint/no-unused-vars */
    public async getCustomClaims(token: TokenClaims, userInfo: UserInfoClaims): Promise<CustomClaims> {
        return {} as CustomClaims;
    }
}
