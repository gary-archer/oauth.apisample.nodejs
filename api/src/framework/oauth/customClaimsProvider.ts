import {CoreApiClaims} from './coreApiClaims';

/*
 * An interface for adding custom claims from within core claims handling code
 */
export interface CustomClaimsProvider<TClaims extends CoreApiClaims> {

    // TODO: Make this an abstract class as for C# and Java
    addCustomClaims(accessToken: string, claims: TClaims): Promise<void>;
}
