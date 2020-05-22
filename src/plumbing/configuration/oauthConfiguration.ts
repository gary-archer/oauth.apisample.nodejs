/*
 * OAuth configuration settings
 */
export interface OAuthConfiguration {

    // The base URL of the Authorization Server
    authority: string;

    // The client id used for introspection requests
    clientId: string;

    // The client secret used for introspection requests
    clientSecret: string;

    // The maximum time for which claims are cached
    maxClaimsCacheMinutes: number;
}
