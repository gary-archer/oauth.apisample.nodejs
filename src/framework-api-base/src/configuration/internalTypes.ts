/*
 * API framework types used for dependency injection but not exposed to application code
 */
export const INTERNALTYPES = {
    Configuration: Symbol.for('Configuration'),
    HeaderAuthenticator: Symbol.for('HeaderAuthenticator'),
};
