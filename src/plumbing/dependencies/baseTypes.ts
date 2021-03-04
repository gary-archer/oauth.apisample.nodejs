/*
 * Plumbing types that can be injected into application code
 */
export const BASETYPES = {
    ClaimsCache: Symbol.for('ClaimsCache'),
    CustomClaims: Symbol.for('CustomClaims'),
    CustomClaimsProvider: Symbol.for('CustomClaimsProvider'),
    IssuerMetadata: Symbol.for('IssuerMetadata'),
    LogEntry: Symbol.for('LogEntry'),
    LoggerFactory: Symbol.for('LoggerFactory'),
    LoggingConfiguration: Symbol.for('Configuration'),
    OAuthAuthenticator: Symbol.for('OAuthAuthenticator'),
    OAuthConfiguration: Symbol.for('OAuthConfiguration'),
    TokenClaims: Symbol.for('TokenClaims'),
    UnhandledExceptionHandler: Symbol.for('UnhandledExceptionHandler'),
    UserInfoClaims: Symbol.for('UserInfoClaims'),
};
