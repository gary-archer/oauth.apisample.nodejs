import {IntrospectionResponse} from 'openid-client';

/*
 * An interface for validating tokens, which can have multiple implementations
 */
export interface TokenValidator {
    validateToken(accessToken: string): Promise<IntrospectionResponse>;
}