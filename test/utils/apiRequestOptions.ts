/*
 * Some options suitable for our API tests
 */
export interface ApiRequestOptions {
    httpMethod: string;
    apiPath: string;
    accessToken: string;
    rehearseException?: boolean;
}
