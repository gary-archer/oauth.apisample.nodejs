import {JWTPayload} from 'jose';
import {Request} from 'express';
import {ClaimsPrincipal} from '../../plumbing/claims/claimsPrincipal.js';
import {ClaimsReader} from '../../plumbing/claims/claimsReader.js';
import {ExtraClaims} from '../../plumbing/claims/extraClaims.js';
import {ExtraClaimsProvider} from '../../plumbing/claims/extraClaimsProvider.js';
import {ChildContainerHelper} from '../../plumbing/dependencies/childContainerHelper.js';
import {SAMPLETYPES} from '../dependencies/sampleTypes.js';
import {UserRepository} from '../repositories/userRepository.js';
import {CustomClaimNames} from './customClaimNames.js';
import {SampleExtraClaims} from './sampleExtraClaims.js';

/*
 * Add extra claims that you cannot, or do not want to, manage in the authorization server
 */
export class SampleExtraClaimsProvider extends ExtraClaimsProvider {

    /*
     * Get additional claims from the API's own database
     */
    public async lookupExtraClaims(jwtClaims: JWTPayload, request: Request): Promise<ExtraClaims> {

        // Get an object to look up user information
        const perRequestContainer = ChildContainerHelper.resolve(request);
        const userRepository = perRequestContainer.get<UserRepository>(SAMPLETYPES.UserRepository);

        // The manager ID is a business user identity from which other claims can be looked up
        const managerId = ClaimsReader.getStringClaim(jwtClaims, CustomClaimNames.managerId);
        return userRepository.getClaimsForManagerId(managerId);
    }

    /*
     * Create a claims principal containing both token claims and extra claims
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public createClaimsPrincipal(jwtClaims: JWTPayload, extraClaims: ExtraClaims, request: Request): ClaimsPrincipal {
        return new ClaimsPrincipal(jwtClaims, extraClaims);
    }

    /*
     * Deserialize extra claims after they have been read from the cache
     */
    public deserializeFromCache(data: any): ExtraClaims {
        return SampleExtraClaims.importData(data);
    }
}
