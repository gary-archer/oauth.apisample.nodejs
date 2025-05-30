import {JWTPayload} from 'jose';
import {ClaimsReader} from '../../plumbing/claims/claimsReader.js';
import {ExtraClaimsProvider} from '../../plumbing/claims/extraClaimsProvider.js';
import {CustomClaimNames} from '../claims/customClaimNames.js';
import {ExtraClaims} from '../claims/extraClaims.js';

/*
 * A repository that returns extra authorization values from the API's own data
 */
export class UserRepository implements ExtraClaimsProvider {

    /*
     * Given a manager ID in the access token, look up extra values from the API's own data
     */
    public async lookupExtraClaims(jwtClaims: JWTPayload): Promise<any> {

        const managerId = ClaimsReader.getStringClaim(jwtClaims, CustomClaimNames.managerId);
        if (managerId === '20116') {

            // These claims are used for the guestadmin@example.com user account
            return new ExtraClaims('Global Manager', ['Europe', 'USA', 'Asia']);

        } else if (managerId == '10345') {

            // These claims are used for the guestuser@example.com user account
            return new ExtraClaims('Regional Manager', ['USA']);

        } else {

            // Use empty claims for unrecognized users
            return new ExtraClaims('', []);
        }
    }
}
