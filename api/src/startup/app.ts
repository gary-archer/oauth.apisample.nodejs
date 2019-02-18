import * as fs from 'fs-extra';
import {Container} from 'inversify';
import 'reflect-metadata';
import {Configuration} from '../configuration/configuration';
import {ErrorHandler} from '../framework/errors/errorHandler';
import {ApiLogger} from '../framework/utilities/apiLogger';
import {DebugProxyAgent} from '../framework/utilities/debugProxyAgent';
import {Bootstrap} from './bootstrap';
import {HttpServer} from './httpServer';

(async () => {

    // Initialize diagnostics
    ApiLogger.initialize();
    DebugProxyAgent.initialize();

    try {

        // First load configuration
        const apiConfigBuffer = fs.readFileSync('api.config.json');
        const apiConfig = JSON.parse(apiConfigBuffer.toString()) as Configuration;

        // Create the container and register the API dependencies
        const container = new Container();
        Bootstrap.registerDependencies(container);

        // Run our HTTP configuration and then start the server
        const httpServer = new HttpServer(apiConfig, container);
        await httpServer.initialize();
        httpServer.start();

    } catch (e) {

        // Report startup errors
        const error = ErrorHandler.fromException(e);
        ApiLogger.error(JSON.stringify(error.toLogFormat()));
    }
})();
