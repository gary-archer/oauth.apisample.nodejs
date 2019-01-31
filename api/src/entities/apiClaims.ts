import {UserInfoClaims} from './userInfoClaims';

/*
 * API claims used for authorization
 */
export class ApiClaims {

    // The immutable user id from the access token, which may exist in the API's database
    private _userId: string;

    // The calling application's client id can potentially be used for authorization
    private _callingApplicationId: string;

    // OAuth scopes can represent high level areas of the business
    private _scopes: string[];

    // Data from the OAuth user info endpoint
    private _centralUserInfo: UserInfoClaims;

    // Product Specific data used for authorization
    private _accountsCovered: number[];

    /*
     * Initialize from token details we are interested in
     */
    public constructor(userId: string, callingApplicationId: string, scope: string) {

        // Set from input
        this._userId = userId;
        this._callingApplicationId = callingApplicationId;
        this._scopes = scope.split(' ');

        // Default items that will be created properly later
        this._centralUserInfo = new UserInfoClaims('', '', '');
        this._accountsCovered = [];
    }

    public get userId(): string {
        return this._userId;
    }

    public get callingApplicationId(): string {
        return this._callingApplicationId;
    }

    public get scopes(): string[] {
        return this._scopes;
    }

    public get centralUserInfo(): UserInfoClaims {
        return this._centralUserInfo;
    }

    public set centralUserInfo(userInfo: UserInfoClaims) {
        this._centralUserInfo = userInfo;
    }

    public get accountsCovered(): number[] {
        return this._accountsCovered;
    }

    public set accountsCovered(accountsCovered: number[]) {
        this._accountsCovered = accountsCovered;
    }
}
