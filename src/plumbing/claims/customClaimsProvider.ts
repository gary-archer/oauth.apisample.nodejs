import {TokenClaims} from './tokenClaims';
import {ApiClaims} from './apiClaims';
import {CustomClaims} from './customClaims';
import {UserInfoClaims} from './userInfoClaims';

/*
 * Concrete APIs override this class to include custom claims to the cache
 */
export interface CustomClaimsProvider {

    getCustomClaims(token: TokenClaims, userInfo: UserInfoClaims): Promise<CustomClaims>;

    serialize(claims: ApiClaims): string;

    deserialize(claimsText: string): ApiClaims;
}
