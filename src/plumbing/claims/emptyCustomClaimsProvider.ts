import {CustomClaimsProvider} from '../../plumbing/claims/customClaimsProvider';
import {ApiClaims} from './apiClaims';
import {CustomClaims} from './customClaims';
import {TokenClaims} from './tokenClaims';
import {UserInfoClaims} from './userInfoClaims';

/*
 * A default custom claims provider implementation
 */
export class EmptyCustomClaimsProvider implements CustomClaimsProvider {

    /*
     * Return empty custom claims
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public async getCustomClaims(token: TokenClaims, userInfo: UserInfoClaims): Promise<CustomClaims> {
        return new CustomClaims();
    }

    /*
     * Serialize claims when requested
     */
    public serialize(claims: ApiClaims): string {

        const data = {
            token: claims.token.export(),
            userInfo: claims.userInfo.export(),
            custom: claims.custom.export(),
        };

        return JSON.stringify(data);
    }

    /*
     * Read the claims parts
     */
    public  deserialize(claimsText: string): ApiClaims {

        const data = JSON.parse(claimsText);

        return new ApiClaims(
            TokenClaims.import(data.token),
            UserInfoClaims.import(data.userInfo),
            CustomClaims.import(data.custom)
        );
    }
}
