import {Container} from 'inversify';
import {CompanyController} from '../logic/controllers/companyController';
import {UserInfoController} from '../logic/controllers/userInfoController';
import {CompanyRepository} from '../logic/repositories/companyRepository';
import {JsonFileReader} from '../utilities/jsonFileReader';
import {TYPES} from './types';

/*
 * Compose the application's business dependencies
 */
export class CompositionRoot {

    /*
     * Register business objects as per request dependencies, recreated for each API request
     * Note that Inversify instantiates each per request object at application startup to create a dependency graph
     */
    public static registerDependencies(container: Container): void {

        container.bind<JsonFileReader>(TYPES.JsonFileReader).to(JsonFileReader).inRequestScope();
        container.bind<CompanyRepository>(TYPES.CompanyRepository).to(CompanyRepository).inRequestScope();
        container.bind<CompanyController>(TYPES.CompanyController).to(CompanyController).inRequestScope();
        container.bind<UserInfoController>(TYPES.UserInfoController).to(UserInfoController).inRequestScope();
    }
}
