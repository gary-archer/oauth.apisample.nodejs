/*
 * Application logic classes used with dependency injection
 */
export const APPLICATIONTYPES = {
    CompanyController: Symbol.for('CompanyController'),
    CompanyRepository: Symbol.for('CompanyRepository'),
    CompanyService: Symbol.for('CompanyService'),
    JsonFileReader: Symbol.for('JsonFileReader'),
    UserInfoController: Symbol.for('UserInfoController'),
    UserRepository: Symbol.for('UserRepository'),
};
