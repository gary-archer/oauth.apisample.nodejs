import {JWTPayload} from 'jose';
import {SampleExtraClaims} from '../../logic/entities/sampleExtraClaims.js';
import {ClaimsReader} from '../../plumbing/claims/claimsReader.js';
import {ExtraClaims} from '../../plumbing/claims/extraClaims.js';
import {ExtraClaimsProvider} from '../../plumbing/claims/extraClaimsProvider.js';

/*
 * Add extra claims that you cannot, or do not want to, manage in the authorization server
 */
export class SampleExtraClaimsProvider extends ExtraClaimsProvider {

    /*
     * Get additional claims from the API's own database
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public async lookupBusinessClaims(accessToken: string, jwtClaims: JWTPayload): Promise<ExtraClaims> {

        // It is common to need to get a business user ID for the authenticated user
        // In our example a manager user may be able to view information about investors
        const managerId = this._getManagerId(jwtClaims);

        // A real API would use a database, but this API uses a mock implementation
        if (managerId === '20116') {

            // These claims are used for the guestadmin@mycompany.com user account
            return new SampleExtraClaims(managerId, 'admin', ['Europe', 'USA', 'Asia']);

        } else {

            // These claims are used for the guestuser@mycompany.com user account
            return new SampleExtraClaims(managerId, 'user', ['USA']);
        }
    }

    /*
     * Deserialize extra claims after they have been read from the cache
     */
    public deserializeFromCache(data: any): ExtraClaims {
        return SampleExtraClaims.importData(data);
    }

    /*
     * Get a business user ID that corresponds to the user in the token
     */
    private _getManagerId(jwtClaims: JWTPayload): string {

        const managerId = jwtClaims['manager_id'];
        if (managerId) {

            // The preferred option is for the API to receive the business user identity in the JWT access token
            return managerId as string;

        } else {

            // Otherwise the API must determine the value from the subject claim
            const subject = ClaimsReader.getStringClaim(jwtClaims, 'sub');
            return this._lookupManagerIdFromSubjectClaim(subject);
        }
    }

    /*
     * The API could store a mapping from the subject claim to the business user identity
     */
    private _lookupManagerIdFromSubjectClaim(subject: string): string {

        // A real API would use a database, but this API uses a mock implementation
        // This subject value is for the guestadmin@mycompany.com user account
        const isAdmin = subject === '77a97e5b-b748-45e5-bb6f-658e85b2df91';
        if (isAdmin) {
            return '20116';
        } else {
            return '10345';
        }
    }
}
