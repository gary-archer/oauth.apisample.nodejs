import {Response} from 'express';
import {JWTPayload} from 'jose';

/*
 * Add extra claims that you cannot, or do not want to, manage in the authorization server
 */
export interface ExtraClaimsProvider {

    /*
     * Get additional claims from the API's own database
     */
    lookupExtraClaims(jwtClaims: JWTPayload, response: Response): Promise<any>;
}
