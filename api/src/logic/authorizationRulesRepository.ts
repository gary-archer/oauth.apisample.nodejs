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
     */
    public async getAccountsCoveredByUser(claims: ApiClaims, accessToken: string): Promise<number[]> {

        // A real implementation would return results based on the user id from the token
        // This might be a database lookup or a call to another service
        // const userId = claims.userId;

        // In our case we just return hard coded data
        return [1, 2, 4];
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks() {
        this.getAccountsCoveredByUser = this.getAccountsCoveredByUser.bind(this);
    }
}
