/*
 * Configuration settings to enable standard security and extensible use of claims
 */
export interface OAuthConfiguration {

    // Certain behaviour may be triggered by a provider's capabilities
    provider: string;

    // The expected issuer in JWT access tokens received
    issuer: string;

    // The expected audience in JWT access tokens received
    audience: string;

    // The expected algorithm in JWT access tokens received
    algorithm: string;

    // The endpoint from which to download the token signing public key
    jwksEndpoint: string;

    // The URL to the Authorization Server's user info endpoint, if needed
    userInfoEndpoint: string;

    // The maximum number of minutes for which to cache claims, when applicable
    claimsCacheTimeToLiveMinutes: number;
}
