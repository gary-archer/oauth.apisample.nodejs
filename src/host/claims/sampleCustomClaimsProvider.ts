import {SampleCustomClaims} from '../../logic/entities/sampleCustomClaims';
import {BaseClaims} from '../../plumbing/claims/baseClaims';
import {CustomClaims} from '../../plumbing/claims/customClaims';
import {CustomClaimsProvider} from '../../plumbing/claims/customClaimsProvider';
import {UserInfoClaims} from '../../plumbing/claims/userInfoClaims';

/*
 * This class provides any API specific custom claims
 */
export class SampleCustomClaimsProvider extends CustomClaimsProvider {

    /*
     * When using the StandardAuthorizer this is called at the time of token issuance by the ClaimsController
     */
    public async issue(subject: any): Promise<CustomClaims> {
        return this._get(subject);
    }

    /*
     * When using the ClaimsCachingAuthorizer this is called when an API first receive's the access token
     */
    public async get(accessToken: string, token: BaseClaims, userInfo: UserInfoClaims): Promise<CustomClaims> {
        return this._get(userInfo.email);
    }

    /*
     * Simulate some API logic for identifying the user from the subject
     */
    private async _get(email: string): Promise<CustomClaims> {

        const isAdmin = email.toLowerCase().indexOf('admin') !== -1;
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
     * An override to load custom claims when they are read from the cache
     */
    public deserialize(data: any): CustomClaims {
        return SampleCustomClaims.importData(data);
    }
}
