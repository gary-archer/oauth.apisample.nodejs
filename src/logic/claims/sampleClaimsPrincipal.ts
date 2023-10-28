import {JWTPayload} from 'jose';
import {ClaimsPrincipal} from '../../plumbing/claims/claimsPrincipal.js';
import {ClaimsReader} from '../../plumbing/claims/claimsReader.js';
import {ExtraClaims} from '../../plumbing/claims/extraClaims.js';
import {CustomClaimNames} from './customClaimNames.js';
import {SampleExtraClaims} from './sampleExtraClaims.js';

/*
 * Manages claims that should be issued to the access token, to ensure that it is locked down
 * When the authorization server does not support this, look up such values from extra claims
 */
export class SampleClaimsPrincipal extends ClaimsPrincipal {

    public constructor(jwtClaims: JWTPayload, extraClaims: ExtraClaims) {
        super(jwtClaims, extraClaims);
    }

    public getManagerId(): string {

        if (this.jwt[CustomClaimNames.managerId]) {
            return ClaimsReader.getStringClaim(this.jwt, CustomClaimNames.managerId);
        } else {
            return (this.extra as SampleExtraClaims).managerId || '';
        }
    }

    public getRole(): string {

        if (this.jwt[CustomClaimNames.role]) {
            return ClaimsReader.getStringClaim(this.jwt, CustomClaimNames.role);
        } else {
            return (this.extra as SampleExtraClaims).role || '';
        }
    }
}
