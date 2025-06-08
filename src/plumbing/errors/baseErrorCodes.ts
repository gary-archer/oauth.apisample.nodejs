/*
 * Error codes used by plumbing classes
 */
export class BaseErrorCodes {

    public static readonly routeNotFound = 'route_not_found';

    public static readonly serverError = 'server_error';

    public static readonly invalidToken = 'invalid_token';

    public static readonly tokenSigningKeysDownloadError = 'jwks_download_failure';

    public static readonly insufficientScope = 'insufficient_scope';

    public static readonly exceptionSimulation = 'exception_simulation';
}
