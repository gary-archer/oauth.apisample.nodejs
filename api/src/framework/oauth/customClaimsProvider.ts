import {CoreApiClaims} from './coreApiClaims';

/*
 * A default implementation for adding custom claims from within core claims handling code
 */
export class CustomClaimsProvider<TClaims extends CoreApiClaims> {

    /*
     * This can be overridden by derived classes
     */
    public addCustomClaims(accessToken: string, claims: TClaims): Promise<void> {

        // Look up custom data for authorization and add it to claims
    }
}
