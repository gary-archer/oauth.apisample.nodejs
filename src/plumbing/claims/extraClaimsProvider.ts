import {JWTPayload} from 'jose';
import {Response} from 'express';
import {ExtraClaims} from './extraClaims.js';

/*
 * An interface through which OAuth plumbing code calls a repository in the API logic
 */
export interface ExtraClaimsProvider {
    lookupExtraClaims(jwtClaims: JWTPayload, response: Response): Promise<ExtraClaims>;
}
