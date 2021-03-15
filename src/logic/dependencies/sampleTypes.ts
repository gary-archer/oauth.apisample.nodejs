/*
 * This API's types used with dependency injection
 */
export const SAMPLETYPES = {
    UserInfoController: Symbol.for('UserInfoController'),
    ClaimsController: Symbol.for('ClaimsController'),
    CompanyController: Symbol.for('CompanyController'),
    CompanyService: Symbol.for('CompanyService'),
    CompanyRepository: Symbol.for('CompanyRepository'),
    JsonFileReader: Symbol.for('JsonFileReader')
};
