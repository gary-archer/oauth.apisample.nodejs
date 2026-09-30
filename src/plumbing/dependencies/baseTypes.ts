/*
 * Interfaces must use a symbol when injected, to counteract JavaScript type erasure
 */
export const BASETYPES = {
    ExtraClaimsProvider: Symbol.for('ExtraClaimsProvider'),
    LogEntry: Symbol.for('LogEntry'),
    OAuthConfiguration: Symbol.for('OAuthConfiguration'),
};
