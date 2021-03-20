import {injectable} from 'inversify';
import {ErrorUtils} from '../errors/errorUtils';
import {ApiClaims} from './apiClaims';
import {BaseClaims} from './baseClaims';
import {CustomClaims} from './customClaims';
import {UserInfoClaims} from './userInfoClaims';

/*
 * A default custom claims provider implementation
 */
@injectable()
export class CustomClaimsProvider {

    /*
     * The StandardAuthorizer calls this method, when all claims are included in the access token
     * These claims will have been collected earlier during token issuance by calling the ClaimsController
     */
    public readClaims(tokenData: any): ApiClaims {

        return new ApiClaims(
            this._readBaseClaims(tokenData),
            this._readUserInfoClaims(tokenData),
            this.readCustomClaims(tokenData));
    }

    /*
     * The ClaimsCachingAuthorizer calls this, to ask the API to supply its claims when the token is first received
     */
    public async supplyClaims(tokenData: any, userInfoData: any): Promise<ApiClaims> {

        const customClaims = await this.supplyCustomClaims(tokenData, userInfoData);

        return new ApiClaims(
            this._readBaseClaims(tokenData),
            this._readUserInfoClaims(userInfoData),
            customClaims);
    }

    /*
     * Serialize claims when requested
     */
    public serializeToCache(claims: ApiClaims): string {

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
    public deserializeFromCache(claimsText: string): ApiClaims {

        const data = JSON.parse(claimsText);

        return new ApiClaims(
            BaseClaims.importData(data.token),
            UserInfoClaims.importData(data.userInfo),
            this.deserializeCustomClaimsFromCache(data.custom),
        );
    }

    /*
     * This default implementation can be overridden by derived classes
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    protected readCustomClaims(tokenData: any): CustomClaims {
        return new CustomClaims();
    }

    /*
     * This default implementation can be overridden by derived classes
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    protected async supplyCustomClaims(tokenData: any, userInfoData: any): Promise<CustomClaims> {
        return new CustomClaims();
    }

    /*
     * This can be overridden by derived classes
     */
    protected deserializeCustomClaimsFromCache(data: any): CustomClaims {
        return CustomClaims.importData(data);
    }

    /*
     * Read base claims from the supplied token data
     */
    private _readBaseClaims(data: any): BaseClaims {

        const subject = this.getClaim(data.sub, 'sub');
        const scopes = this.getClaim(data.scope, 'scope').split(' ');
        const expiry = parseInt(this.getClaim(data.exp, 'exp'), 10);
        return new BaseClaims(subject, scopes, expiry);
    }

    /*
     * Read user info claims from the supplied data, which could originate from a token or user info payload
     */
    private _readUserInfoClaims(data: any): UserInfoClaims {

        const givenName = this.getClaim(data.given_name, 'given_name');
        const familyName = this.getClaim(data.family_name, 'family_name');
        const email = this.getClaim(data.email, 'email');
        return new UserInfoClaims(givenName, familyName, email);
    }

    /*
     * Sanity checks when receiving claims to avoid failing later with a cryptic error
     */
    protected getClaim(claim: string | undefined, name: string): string {

        if (!claim) {
            throw ErrorUtils.fromMissingClaim(name);
        }

        return claim;
    }
}
