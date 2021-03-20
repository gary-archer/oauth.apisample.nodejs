/*
 * Plumbing types that can be injected into application code
 */
export const BASETYPES = {
    BaseClaims: Symbol.for('BaseClaims'),
    ClaimsCache: Symbol.for('ClaimsCache'),
    CustomClaims: Symbol.for('CustomClaims'),
    CustomClaimsProvider: Symbol.for('CustomClaimsProvider'),
    JwksClient: Symbol.for('JwksClient'),
    LogEntry: Symbol.for('LogEntry'),
    LoggerFactory: Symbol.for('LoggerFactory'),
    LoggingConfiguration: Symbol.for('Configuration'),
    OAuthClient: Symbol.for('OAuthClient'),
    OAuthConfiguration: Symbol.for('OAuthConfiguration'),
    TokenValidator: Symbol.for('TokenValidator'),
    UnhandledExceptionHandler: Symbol.for('UnhandledExceptionHandler'),
    UserInfoClaims: Symbol.for('UserInfoClaims'),
};
