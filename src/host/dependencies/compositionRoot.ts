import {Container} from 'inversify';
import {SAMPLETYPES} from '../../logic/dependencies/sampleTypes.js';
import {CompanyRepository} from '../../logic/repositories/companyRepository.js';
import {UserRepository} from '../../logic/repositories/userRepository.js';
import {CompanyService} from '../../logic/services/companyService.js';
import {JsonFileReader} from '../../logic/utilities/jsonFileReader.js';
import {CompanyController} from '../controllers/companyController.js';
import {UserInfoController} from '../controllers/userInfoController.js';

/*
 * Compose the application's business dependencies
 */
export class CompositionRoot {

    /*
     * Register this API's dependencies, most of which will be recreated for each API request
     */
    public static registerDependencies(container: Container): void {

        // Controller classes
        container.bind<UserInfoController>(SAMPLETYPES.UserInfoController).to(UserInfoController).inTransientScope();
        container.bind<CompanyController>(SAMPLETYPES.CompanyController).to(CompanyController).inTransientScope();

        // Business logic classes
        container.bind<CompanyService>(SAMPLETYPES.CompanyService).to(CompanyService).inTransientScope();
        container.bind<CompanyRepository>(SAMPLETYPES.CompanyRepository).to(CompanyRepository).inTransientScope();
        container.bind<UserRepository>(SAMPLETYPES.UserRepository).to(UserRepository).inTransientScope();
        container.bind<JsonFileReader>(SAMPLETYPES.JsonFileReader).to(JsonFileReader).inTransientScope();
    }
}
