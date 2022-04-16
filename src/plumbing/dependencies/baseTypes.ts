/*
 * Plumbing types that can be injected into application code
 */
export const BASETYPES = {
    BaseClaims: Symbol.for('BaseClaims'),
    ClaimsCache: Symbol.for('ClaimsCache'),
    CustomClaimsProvider: Symbol.for('CustomClaimsProvider'),
    CustomClaims: Symbol.for('CustomClaims'),
    HttpProxy: Symbol.for('HttpProxy'),
    JwksRetriever: Symbol.for('JwksRetriever'),
    LogEntry: Symbol.for('LogEntry'),
    LoggerFactory: Symbol.for('LoggerFactory'),
    LoggingConfiguration: Symbol.for('Configuration'),
    OAuthAuthenticator: Symbol.for('OAuthAuthenticator'),
    OAuthConfiguration: Symbol.for('OAuthConfiguration'),
    UnhandledExceptionHandler: Symbol.for('UnhandledExceptionHandler'),
    UserInfoClaims: Symbol.for('UserInfoClaims'),
};
