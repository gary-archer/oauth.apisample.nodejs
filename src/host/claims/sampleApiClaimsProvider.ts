import {Request} from 'express';
import {CustomClaimsProvider} from '../../plumbing/claims/customClaimsProvider';
import {SampleApiClaims} from '../claims/sampleApiClaims';

/*
 * An example of including domain specific details in cached claims
 */
export class SampleApiClaimsProvider extends CustomClaimsProvider<SampleApiClaims> {

    /*
     * Add details from the API's own database
     */
    public async addCustomClaims(accessToken: string, request: Request, claims: SampleApiClaims): Promise<void> {

        // Look up the user id in the API's own database
        this._lookupDatabaseUserId(claims);

        // Look up the user id in the API's own data
        this._lookupAuthorizationData(claims);
    }

    /*
     * A real implementation would get the subject / email claims and find a match in the API's own data
     */
    private _lookupDatabaseUserId(claims: SampleApiClaims): void {
        claims.userDatabaseId = '10345';
    }

    /*
     * A real implementation would look up authorization data from the API's own data
     * This could include user roles and any data used for enforcing authorization rules
     */
    private _lookupAuthorizationData(claims: SampleApiClaims): void {

        // We use a coverage based authorization rule where the user can only use data for these regions
        claims.regionsCovered = ['Europe', 'USA'];
    }
}
