/*
 * Web server imports
 */
import * as express from 'express';
import * as cors from 'cors';
import * as path from 'path';

/*
 * Our modules
 */
import GolfApiController from './logic/golfApiController';
import TokenValidator from './plumbing/tokenValidator';
import ErrorHandler from './plumbing/errorHandler';
import ApiLogger from './plumbing/apiLogger';

/*
 * Web parameters
 */
const webDomain = 'http://web.mycompany.com';
const webFilesRoot = '../../';
const port = 80;

/*
 * Create the express instance
 */
const appConfig = require('../app.config.json');
const app = express();
ApiLogger.initialize('info');

/*
 * PRIMITIVE WEB SERVER (http://mycompanyweb.com)
 * Serves web content and uses index.html as the default document
 */
app.get('/spa/*', function (request, response) {
	
    let resourcePath = request.path.replace('spa/', '');
    if (resourcePath === '/') {
	   resourcePath = 'index.html';
    }
    
    let webFilePath = path.join(`${__dirname}/${webFilesRoot}/spa/${resourcePath}`);
    response.sendFile(webFilePath);
});

app.get('/spa', function (request, response) {
    let webFilePath = path.join(`${__dirname}/${webFilesRoot}/spa/index.html`);
    response.sendFile(webFilePath);
});

app.get('/favicon.ico', function (request, response) {
    let webFilePath = path.join(`${__dirname}/${webFilesRoot}/spa/favicon.ico`);
    response.sendFile(webFilePath);
}); 

/*
 * REST API (http://mycompanyapi.com)
 * An  API called across domains by the SPA using a CORS request, with OAuth access tokens
 */
const corsOptions = { origin: webDomain };
app.use('/api/*', cors(corsOptions));

app.get('/api/*', function (request, response, next) {
    
    // Both success and error responses return JSON data
    response.setHeader('Content-Type', 'application/json');
    
    // Always validate tokens before accessing business logic
    ApiLogger.info('API call', 'Validating token');
    let validator = new TokenValidator(request, response, appConfig.oauth);
    validator.validate()
        .then(next)
        .catch(error => { ErrorHandler.reportError(response, error); });
});

app.get('/api/golfers', function (request, response, next) {
    
    ApiLogger.info('API call', 'Request for golfer list');
    let controller = new GolfApiController(request, response);
    controller.getList();
});

app.get('/api/golfers/:id([0-9]+)', function (request, response, next) {
    
    let id = parseInt(request.params.id);
    ApiLogger.info('API call', `Request for golfer details for id: ${id}`);
    let controller = new GolfApiController(request, response);
    controller.getDetails(id);
});

app.use('/api/*', function (unhandledException, request, response, next) {
    ErrorHandler.reportError(response, unhandledException);
});

/*
 * Start listening for HTTP requests
 */
app.listen(port, function () {
    ApiLogger.info('HTTP server', `Listening on port ${port}`);
});