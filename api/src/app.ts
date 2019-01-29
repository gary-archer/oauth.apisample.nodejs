import * as express from 'express';
import * as fs from 'fs-extra';
import {Configuration} from './configuration/configuration';
import {HttpConfiguration} from './plumbing/startup/httpConfiguration';
import {ApiLogger} from './plumbing/utilities/apiLogger';

/*
 * First load configuration
 */
const apiConfigBuffer = fs.readFileSync('api.config.json');
const apiConfig = JSON.parse(apiConfigBuffer.toString()) as Configuration;

 /*
 * Create the express app
 */
const expressApp = express();
ApiLogger.initialize();

/*
 * Set up web server behaviour and start listening for requests
 */
const http = new HttpConfiguration(expressApp, apiConfig);
http.configureApiRoutes();
http.configureWebRoutes();
http.startListening();
