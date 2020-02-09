/*
 * Framework types that can be injected into application code
 */
export const APIFRAMEWORKTYPES = {
    CoreApiClaims: Symbol.for('CoreApiClaims'),
    LoggerFactory: Symbol.for('LoggerFactory'),
    UnhandledExceptionHandler: Symbol.for('UnhandledExceptionHandler'),
};
