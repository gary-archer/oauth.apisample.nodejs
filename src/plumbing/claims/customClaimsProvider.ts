import {ApiClaims} from './apiClaims';
import {CustomClaims} from './customClaims';
import {TokenClaims} from './tokenClaims';
import {UserInfoClaims} from './userInfoClaims';

/*
 * A default custom claims provider implementation
 */
export class CustomClaimsProvider {

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
            token: claims.token.exportData(),
            userInfo: claims.userInfo.exportData(),
            custom: claims.custom.exportData(),
        };

        return JSON.stringify(data);
    }

    /*
     * Read the claims parts
     */
    public  deserialize(claimsText: string): ApiClaims {

        const data = JSON.parse(claimsText);

        return new ApiClaims(
            TokenClaims.importData(data.token),
            UserInfoClaims.importData(data.userInfo),
            this.deserializeCustomClaims(data.custom),
        );
    }

    /*
     * This can be overridden by derived classes
     */
    protected deserializeCustomClaims(data: any): CustomClaims {
        return CustomClaims.importData(data);
    }
}
