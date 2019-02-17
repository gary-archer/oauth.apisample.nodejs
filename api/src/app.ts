import {Application, NextFunction, Request, Response} from 'express';
import * as fs from 'fs-extra';
import {Container} from 'inversify';
import 'reflect-metadata';
import {Configuration} from './configuration/configuration';
import {ApiLogger} from './framework/utilities/apiLogger';
import {DebugProxyAgent} from './framework/utilities/debugProxyAgent';
import {CompanyController} from './logic/companyController';
import {CompanyRepository} from './logic/companyRepository';
import {UserInfoController} from './logic/userInfoController';
import {HttpServer} from './startup/httpServer';
import {BasicApiClaimsAccessor} from './utilities/basicApiClaimsAccessor';
import {JsonFileReader} from './utilities/jsonFileReader';

// Initialize diagnostics
ApiLogger.initialize();
DebugProxyAgent.initialize();

// First load configuration
const apiConfigBuffer = fs.readFileSync('api.config.json');
const apiConfig = JSON.parse(apiConfigBuffer.toString()) as Configuration;

// Let the DI container know about injectable classes and create them on every request
const container = new Container();
container.bind<JsonFileReader>(JsonFileReader).toSelf().inRequestScope();
container.bind<CompanyRepository>(CompanyRepository).toSelf().inRequestScope();
container.bind<CompanyController>(CompanyController).toSelf().inRequestScope();
container.bind<UserInfoController>(UserInfoController).toSelf().inRequestScope();

// I'd like to do this but can't get it to work
// https://github.com/inversify/InversifyJS/issues/381
container.bind<BasicApiClaimsAccessor>(BasicApiClaimsAccessor).toDynamicValue((ctx) => {

    // TODO - figure out how to get the request scope items
    // console.log('*** GETTING CLAIMS');
    if (container.isBound('httpcontext')) {
        const httpContext = ctx.container.get<Request>('httpcontext');
        console.log(httpContext);
    }

    // const context = ctx.currentRequest.requestScope.get('inversify-express-utils:httpcontext');

    // https://stackoverflow.com/questions/54218295/inject-httpcontext-into-inversifyjs-middleware
    // console.log('Trying to get HTTP context');
    // const httpContext = Reflect.getMetadata('inversify-express-utils:httpcontext', request);
    // console.log(httpContext);

    return new BasicApiClaimsAccessor();
});

// Run our HTTP configuration and then start the server
const httpServer = new HttpServer(apiConfig, container);
httpServer.configure();
httpServer.start();

// TODO: Catch startup errors
