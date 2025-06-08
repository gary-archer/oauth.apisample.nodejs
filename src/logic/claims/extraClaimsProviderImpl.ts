import {JWTPayload} from 'jose';
import {Response} from 'express';
import {Container} from 'inversify';
import {ClaimsReader} from '../../plumbing/claims/claimsReader.js';
import {CustomClaimNames} from '../../plumbing/claims/customClaimNames.js';
import {ExtraClaims} from '../../plumbing/claims/extraClaims.js';
import {ExtraClaimsProvider} from '../../plumbing/claims/extraClaimsProvider.js';
import {APPLICATIONTYPES} from '../dependencies/applicationTypes.js';
import {UserRepository} from '../repositories/userRepository.js';

/*
 * Add extra authorization values that you cannot, or do not want to, manage in the authorization server
 */
export class ExtraClaimsProviderImpl implements ExtraClaimsProvider {

    /*
     * Get extra values from the API's own data
     */
    public async lookupExtraClaims(jwtClaims: JWTPayload, response: Response): Promise<ExtraClaims> {

        // Get an object to look up user information
        const container = response.locals.container as Container;
        const userRepository = container.get<UserRepository>(APPLICATIONTYPES.UserRepository);

        // Look up values using the manager ID, a business user identity
        const managerId = ClaimsReader.getStringClaim(jwtClaims, CustomClaimNames.managerId);
        return userRepository.getUserInfoForManagerId(managerId);
    }
}
