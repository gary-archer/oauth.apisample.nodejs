/*
 * Used for dependency injection of framework types
 */
export const FRAMEWORKTYPES = {

    // The framework manages its own configuration
    Configuration: Symbol.for('Configuration'),

    // The framework manages objects for logging and exception handling
    LoggerFactory: Symbol.for('LoggerFactory'),
    ILogEntry: Symbol.for('ILogEntry'),
    UnhandledExceptionHandler: Symbol.for('UnhandledExceptionHandler'),

    // The framework manages core security classes
    IssuerMetadata: Symbol.for('IssuerMetadata'),
    ClaimsCache: Symbol.for('ClaimsCache'),
    ClaimsSupplier: Symbol.for('ClaimsSupplier'),
    OAuthAuthenticator: Symbol.for('OAuthAuthenticator'),
    HeaderAuthenticator: Symbol.for('HeaderAuthenticator'),
    ApiClaims: Symbol.for('ApiClaims'),
};
