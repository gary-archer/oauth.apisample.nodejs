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
import {CustomAuthProvider} from '../framework/oauth/customAuthProvider';

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
    private _expressApp: Application;

    /*
     * Receive the configuration and the container
     */
    public constructor(apiConfig: Configuration, container: Container) {
        this._apiConfig = apiConfig;
        this._container = container;
    }

    /*
     * Configure behaviour before starting the server
     */
    public async initialize(): Promise<void> {

        // Create the server. which will use registered @controller attributes to set up Express routes
        const server = new InversifyExpressServer(
            this._container,
            null,
            {rootPath: '/api'},
            null,
            CustomAuthProvider);

        // Rebind it as a singleton since we want to avoid continually creating it
        this._container.rebind<interfaces.AuthProvider>(TYPE.AuthProvider).to(CustomAuthProvider).inSingletonScope();

        // Initialize OAuth processing
        const authProvider = this._container.get<interfaces.AuthProvider>(TYPE.AuthProvider) as CustomAuthProvider;
        await authProvider.initialize(this._apiConfig.oauth);

        // Configure middleware
        server.setConfig((expressApp: Application) => {

            // We don't want API requests to be cached unless explicitly designed for caching
            expressApp.set('etag', false);

            // Allow cross origin requests from the SPA
            const corsOptions = { origin: this._apiConfig.app.trustedOrigins };
            expressApp.use('/api/*', cors(corsOptions));

            // Configure how web static content is served
            this._configureWebStaticContent(expressApp);
        });

        // Add an API error handler last, which will also catch unhandled promise rejections
        server.setErrorConfig((expressApp) => {
            const errorHandler = new UnhandledExceptionHandler();
            expressApp.use('/api/*', errorHandler.handleException);
        });

        // Create and store a reference to the express app
        this._expressApp = server.build();
    }

    /*
     * Start listening for requests
     */
    public start(): void {

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
        const httpsServer = https.createServer(sslOptions, this._expressApp);
        httpsServer.listen(port, () => {
            console.log(`Server is listening on HTTPS port ${port}`);
        });
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
