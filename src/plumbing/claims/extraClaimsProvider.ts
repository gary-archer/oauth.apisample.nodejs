import {JWTPayload} from 'jose';

/*
 * Add extra claims that you cannot, or do not want to, manage in the authorization server
 */
export interface ExtraClaimsProvider {
    lookupExtraClaims(jwtClaims: JWTPayload): Promise<any>;
}
