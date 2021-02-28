import fs from 'fs-extra';
import {Container} from 'inversify';
import 'reflect-metadata';
import {LoggerFactoryBuilder} from '../../plumbing/logging/loggerFactoryBuilder';
import {HttpProxy} from '../../plumbing/utilities/httpProxy';
import {Configuration} from '../configuration/configuration';
import {HttpServerConfiguration} from './httpServerConfiguration';

/*
 * The application entry point
 */
(async () => {

    // Create initial objects
    const loggerFactory = LoggerFactoryBuilder.create();
    const container = new Container();

    try {

        // Load our JSON configuration and configure log levels
        const configurationBuffer = await fs.readFile('api.config.json');
        const configuration = JSON.parse(configurationBuffer.toString()) as Configuration;
        loggerFactory.configure(configuration.logging);

        // Initialize HTTP debugging for requests to the Authorization Server
        HttpProxy.initialize(configuration.api.useProxy, configuration.api.proxyUrl);

        // Configure the API behaviour at startup
        const httpServer = new HttpServerConfiguration(configuration, container, loggerFactory);
        await httpServer.configure();
        httpServer.start();

    } catch (e) {

        // Report startup errors
        loggerFactory.logStartupError(e);
    }
})();
