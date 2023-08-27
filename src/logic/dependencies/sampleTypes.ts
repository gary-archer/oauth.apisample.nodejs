/*
 * This API's types used with dependency injection
 */
export const SAMPLETYPES = {
    UserInfoController: Symbol.for('UserInfoController'),
    CompanyController: Symbol.for('CompanyController'),
    CompanyService: Symbol.for('CompanyService'),
    CompanyRepository: Symbol.for('CompanyRepository'),
    JsonFileReader: Symbol.for('JsonFileReader'),
    UserRepository: Symbol.for('UserRepository'),
};
