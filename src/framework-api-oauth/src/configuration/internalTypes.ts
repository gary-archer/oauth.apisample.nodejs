/*
 * Framework types used for dependency injection but not exposed to application code
 */
export const INTERNALTYPES = {
    Configuration: Symbol.for('OAuthConfiguration'),
    IssuerMetadata: Symbol.for('IssuerMetadata'),
    ClaimsCache: Symbol.for('ClaimsCache'),
    ClaimsSupplier: Symbol.for('ClaimsSupplier'),
    OAuthAuthenticator: Symbol.for('OAuthAuthenticator'),
};
