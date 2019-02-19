import {Container} from 'inversify';
import {CompanyController} from '../logic/companyController';
import {CompanyRepository} from '../logic/companyRepository';
import {UserInfoController} from '../logic/userInfoController';
import {BasicApiClaimsAccessor} from './basicApiClaimsAccessor';
import {BasicApiClaimsFactory} from './basicApiClaimsFactory';
import {JsonFileReader} from './jsonFileReader';

/*
 * Types used for dependency injection
 */
export const TYPES = {
    JsonFileReader: Symbol.for('JsonFileReader'),
    CompanyRepository: Symbol.for('CompanyRepository'),
    CompanyController: Symbol.for('CompanyController'),
};

// console.log('*** DI, Types is ');
// console.log(TYPES);
// console.log(TYPES.JsonFileReader);

/*
 * Register the application's business dependencies
 */
export class DependencyInjection {

    /*
     * Our dependencies use request scope and are created once per request
     */
    public static register(container: Container): void {

        // console.log('Register');
        // console.log(TYPES);
        // console.log(TYPES.JsonFileReader);

        // TODO: Avoid strings and do this in a more standard way
        container.bind<JsonFileReader>('JsonFileReader').to(JsonFileReader).inRequestScope();
        container.bind<CompanyRepository>('CompanyRepository').to(CompanyRepository).inRequestScope();
        container.bind<CompanyController>('CompanyController').to(CompanyController).inRequestScope();
        container.bind<UserInfoController>('UserInfoController').to(UserInfoController).inRequestScope();
        container.bind<BasicApiClaimsFactory>('BasicApiClaimsFactory').to(BasicApiClaimsFactory).inRequestScope();
        container.bind<BasicApiClaimsAccessor>('BasicApiClaimsAccessor').to(BasicApiClaimsAccessor).inRequestScope();
    }
}
