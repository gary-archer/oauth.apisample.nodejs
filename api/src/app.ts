import * as express from 'express';
import * as fs from 'fs-extra';
import {Configuration} from './configuration/configuration';
import {ErrorHandler} from './plumbing/errors/errorHandler';
import {ApiLogger} from './plumbing/utilities/apiLogger';
import {DebugProxyAgent} from './plumbing/utilities/debugProxyAgent';
import {HttpConfiguration} from './startup/httpConfiguration';

(async () => {

    // Initialize diagnostics
    ApiLogger.initialize();
    DebugProxyAgent.initialize();

    try {

        // First load configuration
        const apiConfigBuffer = fs.readFileSync('api.config.json');
        const apiConfig = JSON.parse(apiConfigBuffer.toString()) as Configuration;

        // Next configure web server behaviour
        const expressApp = express();
        const http = new HttpConfiguration(expressApp, apiConfig);
        http.initializeWeb();
        await http.initializeApi();

        // Start receiving requests
        http.startServer();

    } catch (e) {

        // Report startup errors
        const error = ErrorHandler.fromException(e);
        ApiLogger.error(JSON.stringify(error.toLogFormat()));
    }
})();
