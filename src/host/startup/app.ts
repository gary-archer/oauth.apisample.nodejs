import fs from 'fs-extra';
import {Container} from 'inversify';
import 'reflect-metadata';
import {LoggerFactoryBuilder} from '../../plumbing/logging/loggerFactoryBuilder.js';
import {Configuration} from '../configuration/configuration.js';
import {HttpServerConfiguration} from './httpServerConfiguration.js';

// Create initial objects
const loggerFactory = LoggerFactoryBuilder.create();
const parentContainer = new Container();

try {

    // Load our JSON configuration and configure logging
    const configurationJson = await fs.readFile('api.config.json', 'utf8');
    const configuration = JSON.parse(configurationJson) as Configuration;
    loggerFactory.configure(configuration.logging);

    // Configure the API behaviour at startup
    const httpServer = new HttpServerConfiguration(configuration, parentContainer, loggerFactory);
    await httpServer.configure();
    httpServer.start();

} catch (e) {

    // Report startup errors
    loggerFactory.logStartupError(e);
}
