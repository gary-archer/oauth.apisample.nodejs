import express from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Container} from 'inversify';
import {useExpressServer} from 'routing-controllers';
import {SampleExtraClaimsProvider} from '../../logic/claims/sampleExtraClaimsProvider.js';
import {BaseCompositionRoot} from '../../plumbing/dependencies/baseCompositionRoot.js';
import {LoggerFactory} from '../../plumbing/logging/loggerFactory.js';
import {AuthorizerMiddleware} from '../../plumbing/middleware/authorizerMiddleware.js';
import {ChildContainerMiddleware} from '../../plumbing/middleware/childContainerMiddleware.js';
import {CustomHeaderMiddleware} from '../../plumbing/middleware/customHeaderMiddleware.js';
import {LoggerMiddleware} from '../../plumbing/middleware/loggerMiddleware.js';
import {UnhandledExceptionHandler} from '../../plumbing/middleware/unhandledExceptionHandler.js';
import {Configuration} from '../configuration/configuration.js';
import {CompanyController} from '../controllers/companyController.js';
import {UserInfoController} from '../controllers/userInfoController.js';
import {CompositionRoot} from '../dependencies/compositionRoot.js';

/*
 * Configure HTTP behaviour at application startup
 */
export class HttpServerConfiguration {

    private readonly _configuration: Configuration;
    private readonly _container: Container;
    private readonly _loggerFactory: LoggerFactory;
    private readonly _expressApp: express.Application;

    public constructor(configuration: Configuration, container: Container, loggerFactory: LoggerFactory) {
        this._configuration = configuration;
        this._container = container;
        this._loggerFactory = loggerFactory;
        this._expressApp = express();
    }

    /*
     * Configure Express HTTP server behavior and wire up dependencies
     */
    public async configure(): Promise<void> {

        // Initialize routes
        const apiBasePath = '/investments';
        const allRoutes = `${apiBasePath}*_`;

        // Create Express middleware
        const childContainerMiddleware = new ChildContainerMiddleware(this._container);
        const loggerMiddleware = new LoggerMiddleware(this._loggerFactory!);
        const authorizerMiddleware = new AuthorizerMiddleware();
        const customHeaderMiddleware = new CustomHeaderMiddleware(this._configuration.logging!.apiName);
        const exceptionHandler = new UnhandledExceptionHandler(this._configuration.logging);
        this._expressApp.set('etag', false);
        
        // Register base dependencies
        new BaseCompositionRoot(this._container)
            .useOAuth(this._configuration.oauth)
            .withExtraClaimsProvider(new SampleExtraClaimsProvider())
            .withLogging(this._configuration.logging, this._loggerFactory)
            .withExceptionHandler(exceptionHandler)
            .withProxyConfiguration(this._configuration.api.useProxy, this._configuration.api.proxyUrl)
            .register();

        // Register the API's own dependencies
        CompositionRoot.registerDependencies(this._container);

        // Configure cross cutting cthis._expressApp.set('etag', false);
        this._expressApp.use(allRoutes, childContainerMiddleware.execute);
        this._expressApp.use(allRoutes, loggerMiddleware.execute);
        this._expressApp.use(allRoutes, authorizerMiddleware.execute);
        this._expressApp.use(allRoutes, customHeaderMiddleware.execute);
        
        // Next ask the routing-controller library to create the API's routes from annotations
        useExpressServer(this._expressApp, {
            controllers: [CompanyController, UserInfoController],
        });

        // Configure Express error middleware once routes have been created
        this._expressApp.use(allRoutes, exceptionHandler.execute);
    }

    /*
     * Start listening for requests
     */
    public async start(): Promise<void> {

        const port = this._configuration.api.port;
        if (this._configuration.api.sslCertificateFileName && this._configuration.api.sslCertificatePassword) {

            // Load certificate details
            const pfxFile = await fs.readFile(this._configuration.api.sslCertificateFileName);
            const serverOptions = {
                pfx: pfxFile,
                passphrase: this._configuration.api.sslCertificatePassword,
            };

            // Start listening over HTTPS
            const httpsServer = https.createServer(serverOptions, this._expressApp);
            httpsServer.listen(port, () => {
                console.log(`API is listening on HTTPS port ${port}`);
            });

        } else {

            // Otherwise listen over HTTP
            this._expressApp.listen(port, () => {
                console.log(`API is listening on HTTP port ${port}`);
            });
        }
    }
}
