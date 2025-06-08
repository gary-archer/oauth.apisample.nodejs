import {ExtraClaims} from '../../plumbing/claims/extraClaims.js';

/*
 * A repository that returns hard coded data, whereas a real implementation would use a database lookup
 */
export class UserRepository {

    /*
     * Receive the manager ID in the access token, as a useful API identity, then look up extra authorization values
     */
    public async getUserInfoForManagerId(managerId: string): Promise<any> {

        if (managerId === '20116') {

            // These values are used for the guestadmin@example.com user account
            return ExtraClaims.create('Global Manager', ['Europe', 'USA', 'Asia']);

        } else if (managerId == '10345') {

            // These values are used for the guestuser@example.com user account
            return ExtraClaims.create('Regional Manager', ['USA']);

        } else {

            // Use empty values for unrecognized users
            return new ExtraClaims();
        }
    }
}
