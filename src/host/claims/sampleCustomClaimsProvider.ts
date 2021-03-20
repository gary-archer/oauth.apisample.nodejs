import {SampleCustomClaims} from '../../logic/entities/sampleCustomClaims';
import {CustomClaims} from '../../plumbing/claims/customClaims';
import {CustomClaimsProvider} from '../../plumbing/claims/customClaimsProvider';

/*
 * An example of including domain specific details in cached claims
 */
export class SampleCustomClaimsProvider extends CustomClaimsProvider {

    /*
     * When using the StandardAuthorizer this is called at the time of token issuance by the ClaimsController
     * My Authorization Server setup currently sends the user's email as the subject claim
     */
    public async supplyCustomClaimsFromSubject(subject: any): Promise<SampleCustomClaims> {

        return await this.supplyCustomClaims( {}, { email: subject } ) as SampleCustomClaims;
    }

    /*
     * For a real implementation the custom claims would be looked up from the API's own data
     * When using the StandardAuthorizer this is called at the time of token issuance
     * When using the ClaimsCachingAuthorizer this is called when the API first receives the access token
     */
    protected async supplyCustomClaims(tokenData: any, userInfoData: any): Promise<CustomClaims> {

        const isAdmin = userInfoData.email.toLowerCase().indexOf('admin') !== -1;
        if (isAdmin) {

            // For admin users we hard code this user id, assign a role of 'admin' and grant access to all regions
            // The CompanyService class will use these claims to return all transaction data
            return new SampleCustomClaims('20116', 'admin', []);

        } else {

            // For other users we hard code this user id, assign a role of 'user' and grant access to only one region
            // The CompanyService class will use these claims to return only transactions for the US region
            return new SampleCustomClaims('10345', 'user', ['USA']);
        }
    }

    /*
     * When using the StandardAuthorizer we read all custom claims directly from the token
     */
    protected readCustomClaims(tokenData: any): CustomClaims {

        const userId = this.getClaim(tokenData.user_role, 'user_id');
        const role = this.getClaim(tokenData.user_role, 'user_role');
        const regionsCovered = this.getClaim(tokenData.user_regions, 'user_regions').split(' ');
        return new SampleCustomClaims(userId, role, regionsCovered);
    }

    /*
     * An override to load custom claims when they are read from the cache
     */
    protected deserializeCustomClaimsFromCache(data: any): CustomClaims {
        return SampleCustomClaims.importData(data);
    }
}
