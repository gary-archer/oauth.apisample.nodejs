import {Container} from 'inversify';
import {BasicApiClaims} from '../entities/basicApiClaims';
import {CompanyController} from '../logic/companyController';
import {CompanyRepository} from '../logic/companyRepository';
import {UserInfoController} from '../logic/userInfoController';
import {JsonFileReader} from './jsonFileReader';
import {TYPES} from './types';
import {UserContextAccessor} from './userContextAccessor';

/*
 * Compose the application's business dependencies
 */
export class CompositionRoot {

    /*
     * Most dependencies are given request scope and created once per API request
     */
    public static registerDependencies(container: Container): void {

        // Business logic
        container.bind<JsonFileReader>(TYPES.JsonFileReader).to(JsonFileReader).inRequestScope();
        container.bind<CompanyRepository>(TYPES.CompanyRepository).to(CompanyRepository).inRequestScope();
        container.bind<CompanyController>(TYPES.CompanyController).to(CompanyController).inRequestScope();
        container.bind<UserInfoController>(TYPES.UserInfoController).to(UserInfoController).inRequestScope();

        // Middleware to manage the user context
        container.bind<BasicApiClaims>(TYPES.BasicApiClaims).to(BasicApiClaims).inRequestScope();
        container.bind<UserContextAccessor>(TYPES.UserContextAccessor).to(UserContextAccessor).inRequestScope();
    }
}
