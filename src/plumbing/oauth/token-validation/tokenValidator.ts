import {TokenClaims} from '../../claims/tokenClaims';

/*
 * An interface for validating tokens, which can have multiple implementations
 */
export interface TokenValidator {
    validateToken(accessToken: string): Promise<TokenClaims>;
}