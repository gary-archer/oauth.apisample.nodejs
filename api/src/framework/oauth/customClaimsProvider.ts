import {CoreApiClaims} from './coreApiClaims';

/*
 * An interface for adding custom claims from within core claims handling code
 */
export interface CustomClaimsProvider<TClaims extends CoreApiClaims> {

    addCustomClaims(accessToken: string, claims: TClaims): Promise<void>;
}
