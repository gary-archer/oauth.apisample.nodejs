/*
 * OAuth configuration settings
 */
export interface OAuthConfiguration {

    // The base URL of the Authorization Server
    authority: string;

    // A scope that must be included in access tokens sent to the API
    requiredScope: string;

    // The client id used for introspection requests
    clientId: string;

    // The client secret used for introspection requests
    clientSecret: string;
}
