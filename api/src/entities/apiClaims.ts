import {UserInfoClaims} from './userInfoClaims';

/*
 * API claims used for authorization
 */
export class ApiClaims {

    // The immutable user id from the access token, which may exist in the API's database
    public userId: string;

    // The calling application's client id can potentially be used for authorization
    public callingApplicationId: string;

    // OAuth scopes can represent high level areas of the business
    public scopes: string[];

    // Data from the OAuth user info endpoint
    public centralUserInfo: UserInfoClaims | null;

    // Product Specific data used for authorization
    public accountsCovered: number[];

    /*
     * Initialize from token details we are interested in
     */
    public constructor(userId: string, callingApplicationId: string, scope: string) {
        this.userId = userId;
        this.callingApplicationId = callingApplicationId;
        this.scopes = scope.split(' ');
        this.centralUserInfo = null;
        this.accountsCovered = [];
    }

    /*
     * Set fields after receiving OAuth user info data
     */
    public setCentralUserInfo(givenName: string, familyName: string, email: string) {
        this.centralUserInfo = new UserInfoClaims(givenName, familyName, email);
    }

    /*
     * Set accounts covered by the user
     */
    public setAccountsCovered(accountsCovered: number[]) {
        this.accountsCovered = accountsCovered;
    }
}
