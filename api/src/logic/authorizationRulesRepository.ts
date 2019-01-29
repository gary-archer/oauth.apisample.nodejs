import {ApiClaims} from '../entities/apiClaims';

/*
 * A repository class for returning domain specific authorization rules
 */
export class AuthorizationRulesRepository {

    /*
     * Class setup
     */
    public constructor() {
        this._setupCallbacks();
    }

    /*
     * A stub example of looking up product specific data
     * A real implementation would read from a database or perhaps another microservice
     */
    public async setProductClaims(claims: ApiClaims, accessToken: string): Promise<void> {

        const accountsCovered = this._getAccountsCoveredByUser(claims.userId);
        claims.setProductSpecificUserRights(accountsCovered);
    }

    /*
     * For the purposes of our code sample we will grant access to the first 3 companies
     * However, the API will deny access to company 4, which the user does not have rights to
     */
    private _getAccountsCoveredByUser(userId: string) {
        return [1, 2, 4];
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks() {
        this.setProductClaims = this.setProductClaims.bind(this);
    }
}
