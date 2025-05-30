import {JWTPayload} from 'jose';
import {Response} from 'express';
import {Container} from 'inversify';
import {ClaimsReader} from '../../plumbing/claims/claimsReader.js';
import {ExtraClaimsProvider} from '../../plumbing/claims/extraClaimsProvider.js';
import {SAMPLETYPES} from '../dependencies/sampleTypes.js';
import {UserRepository} from '../repositories/userRepository.js';
import {CustomClaimNames} from './customClaimNames.js';

/*
 * Add extra claims that you cannot, or do not want to, manage in the authorization server
 */
export class ExtraClaimsProviderImpl implements ExtraClaimsProvider {

    /*
     * Get additional claims from the API's own database
     */
    public async lookupExtraClaims(jwtClaims: JWTPayload, response: Response): Promise<any> {

        // Get an object to look up user information
        const container = response.locals.container as Container;
        const userRepository = container.get<UserRepository>(SAMPLETYPES.UserRepository);

        // The manager ID is a business user identity from which other claims can be looked up
        const managerId = ClaimsReader.getStringClaim(jwtClaims, CustomClaimNames.managerId);
        return userRepository.getClaimsForManagerId(managerId);
    }
}
