import {Container} from 'inversify';
import {CompanyController} from '../logic/companyController';
import {CompanyRepository} from '../logic/companyRepository';
import {UserInfoController} from '../logic/userInfoController';
import {BasicApiClaimsAccessor} from '../utilities/basicApiClaimsAccessor';
import {BasicApiClaimsFactory} from '../utilities/basicApiClaimsFactory';
import {JsonFileReader} from '../utilities/jsonFileReader';

/*
 * Register the application's business dependencies
 */
export class Bootstrap {

    /*
     * Our dependencies use request scope and are created once per request
     */
    public static registerDependencies(container: Container): void {

        container.bind<JsonFileReader>('JsonFileReader').to(JsonFileReader).inRequestScope();
        container.bind<CompanyRepository>('CompanyRepository').to(CompanyRepository).inRequestScope();
        container.bind<CompanyController>('CompanyController').to(CompanyController).inRequestScope();
        container.bind<UserInfoController>('UserInfoController').to(UserInfoController).inRequestScope();
        container.bind<BasicApiClaimsFactory>('BasicApiClaimsFactory').to(BasicApiClaimsFactory).inRequestScope();
        container.bind<BasicApiClaimsAccessor>('BasicApiClaimsAccessor').to(BasicApiClaimsAccessor).inRequestScope();
    }
}
