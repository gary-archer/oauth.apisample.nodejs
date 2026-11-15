/*
 * Error codes for the example API
 */
export class ErrorCodes {

    public static readonly routeNotFound = 'route_not_found';

    public static readonly serverError = 'server_error';

    public static readonly invalidToken = 'invalid_token';

    public static readonly tokenSigningKeysDownloadError = 'jwks_download_failure';

    public static readonly insufficientScope = 'insufficient_scope';

    public static readonly insufficientData = 'insufficient_data';

    public static readonly exceptionSimulation = 'exception_simulation';

    public static readonly invalidCompanyId = 'invalid_company_id';

    public static readonly companyNotFound = 'company_not_found';

    public static readonly fileReadError = 'file_read_error';
}
