/*
 * Plumbing types that can be injected into application code
 */
export const BASETYPES = {
    ClaimsCache: Symbol.for('ClaimsCache'),
    ClaimsSupplier: Symbol.for('ClaimsSupplier'),
    CoreApiClaims: Symbol.for('CoreApiClaims'),
    IssuerMetadata: Symbol.for('IssuerMetadata'),
    LogEntry: Symbol.for('LogEntry'),
    LoggerFactory: Symbol.for('LoggerFactory'),
    LoggingConfiguration: Symbol.for('Configuration'),
    OAuthAuthenticator: Symbol.for('OAuthAuthenticator'),
    OAuthConfiguration: Symbol.for('OAuthConfiguration'),
    UnhandledExceptionHandler: Symbol.for('UnhandledExceptionHandler'),
};
