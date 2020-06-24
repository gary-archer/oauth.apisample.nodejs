/*
 * This API's types used with dependency injection
 */
export const SAMPLETYPES = {
    CompanyController: Symbol.for('CompanyController'),
    CompanyService: Symbol.for('CompanyService'),
    CompanyRepository: Symbol.for('CompanyRepository'),
    JsonFileReader: Symbol.for('JsonFileReader'),
    UserInfoController: Symbol.for('UserInfoController'),
};
