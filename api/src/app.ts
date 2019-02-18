import * as fs from 'fs-extra';
import {Container} from 'inversify';
import 'reflect-metadata';
import {Configuration} from './configuration/configuration';
import {BasicApiClaims} from './entities/basicApiClaims';
import {ApiLogger} from './framework/utilities/apiLogger';
import {DebugProxyAgent} from './framework/utilities/debugProxyAgent';
import {CompanyController} from './logic/companyController';
import {CompanyRepository, TYPES} from './logic/companyRepository';
import {UserInfoController} from './logic/userInfoController';
import {HttpServer} from './startup/httpServer';
import {BasicApiClaimsAccessor} from './utilities/basicApiClaimsAccessor';
import {BasicApiClaimsFactory} from './utilities/basicApiClaimsFactory';
import {JsonFileReader} from './utilities/jsonFileReader';

// Initialize diagnostics
ApiLogger.initialize();
DebugProxyAgent.initialize();

// First load configuration
const apiConfigBuffer = fs.readFileSync('api.config.json');
const apiConfig = JSON.parse(apiConfigBuffer.toString()) as Configuration;

// Let the DI container know about injectable classes and create them on every request
const container = new Container();
container.bind<JsonFileReader>('JsonFileReader').to(JsonFileReader).inRequestScope();
container.bind<CompanyRepository>('CompanyRepository').to(CompanyRepository).inRequestScope();
container.bind<CompanyController>('CompanyController').to(CompanyController).inRequestScope();
container.bind<UserInfoController>('UserInfoController').to(UserInfoController).inRequestScope();

// TODO: I'd like to get rid of the need to declare anything here
container.bind<BasicApiClaimsFactory>('BasicApiClaimsFactory').to(BasicApiClaimsFactory).inRequestScope();
container.bind<BasicApiClaimsAccessor>('BasicApiClaimsAccessor').to(BasicApiClaimsAccessor).inRequestScope();

// Run our HTTP configuration and then start the server
const httpServer = new HttpServer(apiConfig, container);
httpServer.configure();
httpServer.start();

// TODO: Catch startup errors
