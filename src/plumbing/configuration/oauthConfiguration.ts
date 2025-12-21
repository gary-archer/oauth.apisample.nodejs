/*
 * Configuration settings to enable standard security and extensible use of claims
 */
export interface OAuthConfiguration {

    issuer: string;

    audience: string;

    algorithm: string;

    scope: string

    jwksEndpoint: string;

    jwksCooldownDuration?: number;

    sessionIdClaimName: string;

    claimsCacheTimeToLiveMinutes: number;
}
