import * as cors from 'cors';
import {Application, Request, Response} from 'express';
import * as fs from 'fs';
import * as https from 'https';
import {Container} from 'inversify';
import {interfaces, InversifyExpressServer, TYPE} from 'inversify-express-utils';
import * as path from 'path';
import * as url from 'url';
import {Configuration} from '../configuration/configuration';
import {UnhandledExceptionHandler} from '../errors/unhandledExceptionHandler';
import {AuthorizationFilter} from '../framework/oauth/authorizationFilter';
import {ApiLogger} from '../framework/utilities/apiLogger';
import {BasicApiClaims} from '../logic/entities/basicApiClaims';
import {BasicApiClaimsFactory} from '../utilities/basicApiClaimsFactory';

/*
 * The relative path to web files
 */
const WEB_FILES_ROOT = '../../..';

/*
 * Configure HTTP behaviour at application startup
 */
export class HttpServer {

    /*
     * Our dependencies
     */
    private _apiConfig: Configuration;
    private _container: Container;

    /*
     * Receive the configuration and the container
     */
    public constructor(apiConfig: Configuration, container: Container) {
        this._apiConfig = apiConfig;
        this._container = container;
    }

    /*
     * Configure then start listening for requests
     */
    public async start(): Promise<void> {

        // Do the startup configuration
        const expressApp = await this.configure();

        // Use the web URL to determine the port
        const webUrl = url.parse(this._apiConfig.app.trustedOrigins[0]);

        // Calculate the port from the URL
        let port = 443;
        if (webUrl.port) {
            port = Number(webUrl.port);
        }

        // Node does not support certificate stores so we need to load a certificate file from disk
        const sslOptions = {
            pfx: fs.readFileSync(`certs/${this._apiConfig.app.sslCertificateFileName}`),
            passphrase: this._apiConfig.app.sslCertificatePassword,
        };

        // Start listening on HTTPS
        const httpsServer = https.createServer(sslOptions, expressApp);
        httpsServer.listen(port, () => {
            ApiLogger.info('HTTP Server', `Listening on HTTPS port ${port}`);
        });
    }

    /*
     * Configure behaviour before starting the server
     */
    private async configure(): Promise<Application> {

        // Create the server. which will use registered @controller attributes to set up Express routes
        const server = new InversifyExpressServer(
            this._container,
            null,
            {rootPath: '/api'},
            null,
            AuthorizationFilter);

        // Configure the security middleware for the API
        await this._configureAuthorizationFilter();

        // Configure other middleware
        server.setConfig((expressApp: Application) => {

            // We don't want API requests to be cached unless explicitly designed for caching
            expressApp.set('etag', false);

            // Allow cross origin requests from the SPA
            const corsOptions = { origin: this._apiConfig.app.trustedOrigins };
            expressApp.use('/api/*', cors(corsOptions));

            // Configure how web static content is served
            this._configureWebStaticContent(expressApp);
        });

        // Configure errormiddleware last, which will also catch unhandled promise rejections
        server.setErrorConfig((expressApp) => {
            const errorHandler = new UnhandledExceptionHandler();
            expressApp.use('/api/*', errorHandler.handleException);
        });

        // Build and return the express app
        return server.build();
    }

    /*
     * Configure behaviour of our authorization handling
     */
    private async _configureAuthorizationFilter(): Promise<void> {

        // Override default behaviour to rebind our custom auth provider as a singleton, then retrieve it
        this._container.rebind<interfaces.AuthProvider>(TYPE.AuthProvider).to(AuthorizationFilter).inSingletonScope();
        const authorizationFilter =
            this._container.get<interfaces.AuthProvider>(TYPE.AuthProvider) as AuthorizationFilter<BasicApiClaims>;

        // Initialize the authentication handler
        await authorizationFilter.initialize(this._apiConfig.oauth, new BasicApiClaimsFactory(this._apiConfig.oauth));
    }

    /*
     * Handle requests for static web content
     */
    private _configureWebStaticContent(expressApp: Application): void {

        expressApp.get('/spa/*', this._getWebResource);
        expressApp.get('/spa', this._getWebRootResource);
        expressApp.get('/favicon.ico', this._getFavicon);
    }

    /*
     * Serve up the requested web file
     */
    private _getWebResource(request: Request, response: Response): void {

        let resourcePath = request.path.replace('spa/', '');
        if (resourcePath === '/') {
           resourcePath = 'index.html';
        }

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/spa/${resourcePath}`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the requested web file
     */
    private _getWebRootResource(request: Request, response: Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/spa/index.html`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up our favicon
     */
    private _getFavicon(request: Request, response: Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/spa/favicon.ico`);
        response.sendFile(webFilePath);
    }
}
