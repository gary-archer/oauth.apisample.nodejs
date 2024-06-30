/*
 * Plumbing types that can be injected into application code
 */
export const BASETYPES = {
    AccessTokenValidator: Symbol.for('AccessTokenValidator'),
    ClaimsPrincipal: Symbol.for('ClaimsPrincipal'),
    ClaimsCache: Symbol.for('ClaimsCache'),
    ExtraClaimsProvider: Symbol.for('ExtraClaimsProvider'),
    HttpProxy: Symbol.for('HttpProxy'),
    JwksRetriever: Symbol.for('JwksRetriever'),
    LogEntry: Symbol.for('LogEntry'),
    LoggerFactory: Symbol.for('LoggerFactory'),
    LoggingConfiguration: Symbol.for('Configuration'),
    OAuthConfiguration: Symbol.for('OAuthConfiguration'),
    OAuthFilter: Symbol.for('OAuthFilter'),
    UnhandledExceptionHandler: Symbol.for('UnhandledExceptionHandler'),
};
