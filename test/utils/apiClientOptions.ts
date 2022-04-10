/*
 * Some options suitable for our API tests
 */
export interface ApiClientOptions {
    httpMethod: string;
    apiPath: string;
    accessToken: string;
    rehearseException?: boolean;
}
