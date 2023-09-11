import {JWTPayload} from 'jose';
import {Container} from 'inversify';
import {Request} from 'express';
import {ClaimsPrincipal} from '../../plumbing/claims/claimsPrincipal.js';
import {ClaimsReader} from '../../plumbing/claims/claimsReader.js';
import {ExtraClaims} from '../../plumbing/claims/extraClaims.js';
import {ExtraClaimsProvider} from '../../plumbing/claims/extraClaimsProvider.js';
import {ChildContainerHelper} from '../../plumbing/dependencies/childContainerHelper.js';
import {SAMPLETYPES} from '../dependencies/sampleTypes.js';
import {UserRepository} from '../repositories/userRepository.js';
import {CustomClaimNames} from './customClaimNames.js';
import {SampleClaimsPrincipal} from './sampleClaimsPrincipal.js';
import {SampleExtraClaims} from './sampleExtraClaims.js';

/*
 * Add extra claims that you cannot, or do not want to, manage in the authorization server
 */
export class SampleExtraClaimsProvider extends ExtraClaimsProvider {

    private readonly _container: Container;

    public constructor(container: Container) {
        super();
        this._container = container;
    }

    /*
     * Get additional claims from the API's own database
     */
    public async lookupExtraClaims(jwtClaims: JWTPayload, request: Request): Promise<ExtraClaims> {

        // Get an object to look up user information
        const perRequestContainer = ChildContainerHelper.resolve(request);
        const userRepository = perRequestContainer.get<UserRepository>(SAMPLETYPES.UserRepository);

        // First, see which claims are included in access tokens
        if (jwtClaims[CustomClaimNames.managerId]) {

            // The best model is to receive a useful user identity in access tokens, along with the user role
            // This ensures a locked down token and also simpler code
            const managerId = ClaimsReader.getStringClaim(jwtClaims, CustomClaimNames.managerId);
            return userRepository.getClaimsForManagerId(managerId);

        } else {

            // With AWS Cognito, there is a lack of support for custom claims in access tokens at the time of writing
            // So the API has to map the subject to its own user identity and look up all custom claims
            return userRepository.getClaimsForSubject(jwtClaims.sub || '');
        }
    }

    /*
     * Create a claims principal that manages lookups across both token claims and extra claims
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public createClaimsPrincipal(jwtClaims: JWTPayload, extraClaims: ExtraClaims, request: Request): ClaimsPrincipal {
        return new SampleClaimsPrincipal(jwtClaims, extraClaims);
    }

    /*
     * Deserialize extra claims after they have been read from the cache
     */
    public deserializeFromCache(data: any): ExtraClaims {
        return SampleExtraClaims.importData(data);
    }
}
