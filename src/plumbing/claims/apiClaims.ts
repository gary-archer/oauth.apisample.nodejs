import {CustomClaims} from './customClaims';
import {TokenClaims} from './tokenClaims';
import {UserInfoClaims} from './userInfoClaims';

/*
 * An extensible claims object for APIs
 */
export class ApiClaims {

    private _tokenClaims: TokenClaims;
    private _userInfoClaims: UserInfoClaims;
    private _customClaims: CustomClaims;

    public static importData(data: any): ApiClaims {

        return new ApiClaims(
            TokenClaims.importData(data.token),
            UserInfoClaims.importData(data.userInfo),
            CustomClaims.importData(data.custom));
    }

    public constructor(tokenClaims: TokenClaims, userInfoClaims: UserInfoClaims, customClaims: CustomClaims) {
        this._tokenClaims = tokenClaims;
        this._userInfoClaims = userInfoClaims;
        this._customClaims = customClaims;
    }

    public get token(): TokenClaims {
        return this._tokenClaims;
    }

    public get userInfo(): UserInfoClaims {
        return this._userInfoClaims;
    }

    public get custom(): CustomClaims {
        return this._customClaims;
    }

    public export(): any {

        return {
            'token': this.token.exportData(),
            'userInfo': this.userInfo.exportData(),
            'custom': this.custom.exportData(),
        };
    }
}
