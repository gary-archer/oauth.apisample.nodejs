import * as fs from 'fs-extra';

// The ordering of these two dependencies is important for inversify to work
import {Container} from 'inversify';
import 'reflect-metadata';

import {Configuration} from '../configuration/configuration';
import {ErrorHandler} from '../framework/errors/errorHandler';
import {ApiLogger} from '../framework/utilities/apiLogger';
import {DebugProxyAgent} from '../framework/utilities/debugProxyAgent';
import {CompositionRoot} from '../utilities/compositionRoot';
import {HttpServer} from './httpServer';

// The application entry point
(async () => {

    // Initialize diagnostics
    ApiLogger.initialize();
    DebugProxyAgent.initialize();

    try {

        // Load our JSON configuration
        const apiConfigBuffer = fs.readFileSync('api.config.json');
        const apiConfig = JSON.parse(apiConfigBuffer.toString()) as Configuration;

        // Create the container and register the API's dependencies
        const container = new Container();
        CompositionRoot.registerDependencies(container);

        // Configure then start the server
        const httpServer = new HttpServer(apiConfig, container);
        await httpServer.start();

    } catch (e) {

        // Report startup errors
        const error = ErrorHandler.fromException(e);
        ApiLogger.error(JSON.stringify(error.toLogFormat()));
    }
})();
