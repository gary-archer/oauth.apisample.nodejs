import {injectable} from 'inversify';
import {CustomClaims} from './customClaims';
import {TokenClaims} from './tokenClaims';
import {UserInfoClaims} from './userInfoClaims';

/*
 * An extensible claims object for APIs
 */
@injectable()
export class ApiClaims {

    private _tokenClaims: TokenClaims;
    private _userInfoClaims: UserInfoClaims;
    private _customClaims: CustomClaims;

    public static import(data: any): ApiClaims {

        return new ApiClaims(
            TokenClaims.import(data.token),
            UserInfoClaims.import(data.userInfo),
            CustomClaims.import(data.custom));
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
            'token': this.token.export(),
            'userInfo': this.userInfo.export(),
            'custom': this.custom.export(),
        };
    }
}
