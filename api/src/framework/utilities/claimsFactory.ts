import {CoreApiClaims} from '../oauth/coreApiClaims';

/*
 * A utility interface for managing generic object creation at runtime
 */
export interface ClaimsFactory<TClaims extends CoreApiClaims> {

    // Create a new claims object
    createEmptyClaims(): TClaims;

    // The claims cache is created at application startup
    createClaimsCache(): ClaimsCache<TClaims>;
}
