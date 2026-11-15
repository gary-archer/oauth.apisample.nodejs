/*
 * Configuration related to claims caching in the API
 */
export interface ClaimsCacheConfiguration {

    // The URL to the Authorization Server's user info endpoint, for user info claims
    userInfoEndpoint: string;

    // The maximum number of minutes for which to cache claims
    timeToLiveMinutes: number;
}
