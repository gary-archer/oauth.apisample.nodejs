import {CoreApiClaims} from './coreApiClaims';

/*
 * An interface for adding custom claims from within core claims handling code
 */
export interface CustomClaimsProvider {

    addCustomClaims(accessToken: string, claims: CoreApiClaims): Promise<void>;
}
