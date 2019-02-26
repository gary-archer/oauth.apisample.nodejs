import {Container} from 'inversify';
import {CompanyController} from '../logic/controllers/companyController';
import {UserInfoController} from '../logic/controllers/userInfoController';
import {BasicApiClaims} from '../logic/entities/basicApiClaims';
import {CompanyRepository} from '../logic/repositories/companyRepository';
import {JsonFileReader} from '../utilities/jsonFileReader';
import {UserContextAccessor} from '../utilities/userContextAccessor';
import {TYPES} from './types';

/*
 * Compose the application's business dependencies
 */
export class CompositionRoot {

    /*
     * Most dependencies are given request scope and created once per API request
     * Note that all of the below bound objects get created once at application startup
     */
    public static registerDependencies(container: Container): void {

        // Business objects
        container.bind<JsonFileReader>(TYPES.JsonFileReader).to(JsonFileReader).inRequestScope();
        container.bind<CompanyRepository>(TYPES.CompanyRepository).to(CompanyRepository).inRequestScope();
        container.bind<CompanyController>(TYPES.CompanyController).to(CompanyController).inRequestScope();
        container.bind<UserInfoController>(TYPES.UserInfoController).to(UserInfoController).inRequestScope();

        // Middleware to manage the user context
        container.bind<BasicApiClaims>(TYPES.BasicApiClaims).to(BasicApiClaims).inRequestScope();
        container.bind<UserContextAccessor>(TYPES.UserContextAccessor).to(UserContextAccessor).inRequestScope();
    }
}
