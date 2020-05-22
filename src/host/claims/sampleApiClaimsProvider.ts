import {Request} from 'express';
import {CustomClaimsProvider} from '../../plumbing/claims/customClaimsProvider';
import {SampleApiClaims} from '../claims/sampleApiClaims';

/*
 * An example of including domain specific authorization rules during claims lookup
 */
export class SampleApiClaimsProvider extends CustomClaimsProvider<SampleApiClaims> {

    /*
     * Our sample will allow the user to access data associated to the below regions but not for Asia
     */
    public async addCustomClaims(accessToken: string, request: Request, claims: SampleApiClaims): Promise<void> {

        // We will hard code the coverage, whereas a real scenario would look up the user data
        claims.regionsCovered = ['Europe', 'USA'];
    }
}
