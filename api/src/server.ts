/*
 * Web server imports
 */
import * as express from 'express';
import * as apiConfig from '../api.config.json';
import WebServer from './webServer';
import WebApi from './logic/webApi';

/*
 * Create the express app
 */
const expressApp = express();

/*
 * Configure the web server
 */
let webServer = new WebServer(expressApp);
webServer.configureRoutes();

/*
 * Configure the API
 */
var api = new WebApi(expressApp, apiConfig);
api.configureRoutes();

/*
 * Start listening for HTTP requests
 */
expressApp.listen(apiConfig.app.port, () => {
    console.log(`Server is listening on HTTP port ${apiConfig.app.port}`);
});