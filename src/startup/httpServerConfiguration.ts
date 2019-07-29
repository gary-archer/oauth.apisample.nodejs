import * as cors from 'cors';
import * as express from 'express';
import * as fs from 'fs';
import * as https from 'https';
import {Container} from 'inversify';
import {InversifyExpressServer, TYPE} from 'inversify-express-utils';
import * as path from 'path';
import * as url from 'url';
import {Configuration} from '../configuration/configuration';
import {CompositionRoot} from '../dependencies/compositionRoot';
import * as framework from '../framework';
import {BasicApiClaimsProvider} from '../logic/authorization/basicApiClaimsProvider';
import {BasicApiClaims} from '../logic/entities/basicApiClaims';

/*
 * The relative path to web files, from the standalone SPA code sample
 */
const WEB_FILES_ROOT = '../../../authguidance.websample.final';

/*
 * Configure HTTP behaviour at application startup
 */
export class HttpServerConfiguration {

    /*
     * Our dependencies
     */
    private readonly _configuration: Configuration;
    private readonly _container: Container;
    private readonly _loggerFactory: framework.ILoggerFactory;
    private readonly _expressApp: express.Application;

    /*
     * Receive the configuration and the container
     */
    public constructor(configuration: Configuration, container: Container, loggerFactory: framework.ILoggerFactory) {
        this._configuration = configuration;
        this._container = container;
        this._loggerFactory = loggerFactory;
        this._expressApp = express();
    }

    /*
     * Configure behaviour before starting the server
     */
    public async configure(): Promise<void> {

        // Create an authorizer and register its dependencies
        const authorizer = await new framework.OAuthAuthorizerBuilder<BasicApiClaims>(
            this._container,
            this._configuration.framework,
            this._loggerFactory)
                .withClaimsSupplier(BasicApiClaims)
                .withCustomClaimsProviderSupplier(BasicApiClaimsProvider)
                .register();

        // Register base framework dependencies
        const frameworkInitialiser = new framework.FrameworkInitialiser(
            this._container,
            this._configuration.framework,
            this._loggerFactory)
                .withApiBasePath('/api/')
                .register();

        // Register the API's business logic dependencies
        CompositionRoot.registerDependencies(this._container);

        // Configure Express, which will also register @controller attributes
        new InversifyExpressServer(
            this._container,
            null,
            {rootPath: '/api/'},
            this._expressApp)
        .setConfig(() => {

            // Our API requests are not designed for caching
            this._expressApp.set('etag', false);

            // First register the middleware to allow cross origin requests from the SPA
            // This prevents other middleware firing for OPTIONS requests
            const corsOptions = { origin: this._configuration.api.trustedOrigins };
            this._expressApp.use('/api/*', cors(corsOptions));

            // Configure how web static content is served
            this._configureWebStaticContent();

            // Configure framework middleware
            frameworkInitialiser.configureMiddleware(this._expressApp, authorizer);
        })
        .setErrorConfig(() => {
            frameworkInitialiser.configureExceptionHandler(this._expressApp);
        })
        .build();
    }

    /*
     * Start listening for requests
     */
    public start(): void {

        // Use the web URL to determine the port
        const webUrl = url.parse(this._configuration.api.trustedOrigins[0]);

        // Calculate the port from the URL
        let port = 443;
        if (webUrl.port) {
            port = Number(webUrl.port);
        }

        // Node does not support certificate stores so we need to load a certificate file from disk
        const sslOptions = {
            pfx: fs.readFileSync(`certs/${this._configuration.api.sslCertificateFileName}`),
            passphrase: this._configuration.api.sslCertificatePassword,
        };

        // Start listening on HTTPS
        const httpsServer = https.createServer(sslOptions, this._expressApp);
        httpsServer.listen(port, () => {

            // Show a startup message
            const logger = this._loggerFactory.createStartupConsoleLogger('HTTP Server');
            logger.info(`Listening on HTTPS port ${port}`);
        });
    }

    /*
     * Handle requests for static web content
     */
    private _configureWebStaticContent(): void {

        this._expressApp.get('/spa/*', this._getWebResource);
        this._expressApp.get('/spa', this._getWebRootResource);
        this._expressApp.get('/favicon.ico', this._getFavicon);
    }

    /*
     * Serve up the requested web file
     */
    private _getWebResource(request: express.Request, response: express.Response): void {

        let resourcePath = request.path.replace('spa/', '');
        if (resourcePath === '/') {
           resourcePath = 'index.html';
        }

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/${resourcePath}`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the requested web file
     */
    private _getWebRootResource(request: express.Request, response: express.Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/index.html`);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up our favicon
     */
    private _getFavicon(request: express.Request, response: express.Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/favicon.ico`);
        response.sendFile(webFilePath);
    }
}
