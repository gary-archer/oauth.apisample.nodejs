/*
 * Configuration settings to enable standard security and extensible use of claims
 */
export interface OAuthConfiguration {

    // The expected issuer in JWT access tokens received
    issuer: string;

    // The expected audience in JWT access tokens received
    audience: string;

    // The endpoint from which to download the token signing public key
    jwksEndpoint: string;

    // In test environments this is set to zero
    jwksCooldownDuration?: number;

    // The maximum number of minutes for which to cache extra claims
    claimsCacheTimeToLiveMinutes: number;
}
