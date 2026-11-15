import {inject, injectable} from 'inversify';
import {JWTPayload} from 'jose';
import {Response} from 'express';
import {UserRepository} from '../../logic/repositories/userRepository.js';
import {ClaimsReader} from './claimsReader.js';
import {CustomClaimNames} from './customClaimNames.js';
import {ExtraClaims} from './extraClaims.js';

/*
 * Add extra authorization values that you cannot, or do not want to, manage in the authorization server
 */
@injectable()
export class ExtraClaimsProvider {

    private readonly userRepository: UserRepository;

    public constructor(@inject(UserRepository) userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    /*
     * Get extra values from the API's own data
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    public async lookupExtraClaims(jwtClaims: JWTPayload, response: Response): Promise<ExtraClaims> {

        const managerId = ClaimsReader.getStringClaim(jwtClaims, CustomClaimNames.managerId);
        return this.userRepository.getUserInfoForManagerId(managerId);
    }
}
