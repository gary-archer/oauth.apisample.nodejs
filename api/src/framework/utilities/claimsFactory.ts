import {CoreApiClaims} from '../oauth/coreApiClaims';
import {CustomClaimsProvider} from '../oauth/customClaimsProvider';

/*
 * A utility interface for managing generic object creation at runtime
 */
export interface ClaimsFactory<TClaims extends CoreApiClaims> {

    // Create a new claims object
    createEmptyClaims(): TClaims;

    // The claims cache is created at application startup
    createClaimsCache(): ClaimsCache<TClaims>;

    // A new custom claims provider is created then populated on every request with a new token
    createCustomClaimsProvider(): CustomClaimsProvider<TClaims>;
}
