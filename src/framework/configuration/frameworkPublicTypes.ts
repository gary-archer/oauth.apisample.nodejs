/*
 * Framework types that can be injected into application code
 */
export const FRAMEWORKPUBLICTYPES = {
    ILoggerFactory: Symbol.for('ILoggerFactory'),
    ILogEntry: Symbol.for('ILogEntry'),
    ApiClaims: Symbol.for('ApiClaims'),
    UnhandledExceptionHandler: Symbol.for('UnhandledExceptionHandler'),
};
