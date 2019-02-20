/*
 * Types used for dependency injection
 */
export const TYPES = {

    // Business logic
    JsonFileReader: Symbol.for('JsonFileReader'),
    CompanyRepository: Symbol.for('CompanyRepository'),
    CompanyController: Symbol.for('CompanyController'),
    UserInfoController: Symbol.for('UserInfoController'),

    // Middleware used to manage user context
    BasicApiClaims: Symbol.for('BasicApiClaims'),
    UserContextAccessor: Symbol.for('UserContextAccessor'),
};
