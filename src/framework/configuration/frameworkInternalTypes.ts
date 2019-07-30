/*
 * Framework types used for dependency injection but not exposed to application code
 */
export const FRAMEWORKINTERNALTYPES = {
    Configuration: Symbol.for('Configuration'),
    IssuerMetadata: Symbol.for('IssuerMetadata'),
    ClaimsCache: Symbol.for('ClaimsCache'),
    ClaimsSupplier: Symbol.for('ClaimsSupplier'),
    OAuthAuthenticator: Symbol.for('OAuthAuthenticator'),
    HeaderAuthenticator: Symbol.for('HeaderAuthenticator'),
};
