import fs from 'fs-extra';
import {Container} from 'inversify';
import 'reflect-metadata';
import {LoggerFactoryBuilder} from '../../plumbing/logging/loggerFactoryBuilder.js';
import {Configuration} from '../configuration/configuration.js';
import {HttpServerConfiguration} from './httpServerConfiguration.js';

// Create initial objects
const loggerFactory = LoggerFactoryBuilder.create();
const container = new Container();

try {

    // Load our JSON configuration and configure logging
    const configurationBuffer = await fs.readFile('api.config.json');
    const configuration = JSON.parse(configurationBuffer.toString()) as Configuration;
    loggerFactory.configure(configuration.logging);

    // Configure the API behaviour at startup
    const httpServer = new HttpServerConfiguration(configuration, container, loggerFactory);
    await httpServer.configure();
    httpServer.start();

} catch (e) {

    // Report startup errors
    loggerFactory.logStartupError(e);
}
