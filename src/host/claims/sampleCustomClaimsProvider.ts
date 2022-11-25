import {JWTPayload} from 'jose';
import {SampleCustomClaims} from '../../logic/entities/sampleCustomClaims';
import {BaseClaims} from '../../plumbing/claims/baseClaims';
import {CustomClaims} from '../../plumbing/claims/customClaims';
import {CustomClaimsProvider} from '../../plumbing/claims/customClaimsProvider';
import {UserInfoClaims} from '../../plumbing/claims/userInfoClaims';

/*
 * A provider of domain specific claims
 */
export class SampleCustomClaimsProvider extends CustomClaimsProvider {

    /*
     * When using the StandardAuthorizer, this is called at the time of token issuance
     */
    public async issue(subject: any): Promise<CustomClaims> {
        return this._get(subject);
    }

    /*
     * When using the StandardAuthorizer, this is called to read claims from the access token
     */
    public async getFromPayload(payload: JWTPayload): Promise<CustomClaims> {

        const userId = payload['user_id'] as string;
        const userRole = payload['user_role'] as string;
        const userRegions = payload['user_regions'] as string[];
        return new SampleCustomClaims(userId, userRole, userRegions);
    }

    /*
     * When using the ClaimsCachingAuthorizer, this is called to get extra claims when the token is first received
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public async getFromLookup(
        accessToken: string,
        baseClaims: BaseClaims,
        userInfo: UserInfoClaims): Promise<CustomClaims> {

        return this._get(baseClaims.subject);
    }

    /*
     * Determine the user in business terms from the Authorization Server's subject claim
     */
    private async _get(subject: string): Promise<CustomClaims> {

        // A real system wuld do a database lookup herem, but I am hard coding based on an AWS Cognito user
        const isAdmin = subject === '77a97e5b-b748-45e5-bb6f-658e85b2df91';
        if (isAdmin) {

            // For admin users we hard code this user id, assign a role of 'admin' and grant access to all regions
            // The CompanyService class will use these claims to return all transaction data
            return new SampleCustomClaims('20116', 'admin', ['Europe', 'USA', 'Asia']);

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
