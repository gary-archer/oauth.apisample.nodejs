import express from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Container} from 'inversify';
import {SampleExtraClaimsProvider} from '../../logic/claims/sampleExtraClaimsProvider.js';
import {BaseCompositionRoot} from '../../plumbing/dependencies/baseCompositionRoot.js';
import {LoggerFactory} from '../../plumbing/logging/loggerFactory.js';
/*import {AuthorizerMiddleware} from '../../plumbing/middleware/authorizerMiddleware.js';
import {ChildContainerMiddleware} from '../../plumbing/middleware/childContainerMiddleware.js';
import {CustomHeaderMiddleware} from '../../plumbing/middleware/customHeaderMiddleware.js';
import {LoggerMiddleware} from '../../plumbing/middleware/loggerMiddleware.js';*/
import {UnhandledExceptionHandler} from '../../plumbing/middleware/unhandledExceptionHandler.js';
import {Configuration} from '../configuration/configuration.js';
import {CompositionRoot} from '../dependencies/compositionRoot.js';
import {router} from '../routes/controllerDecorator.js';

/*
 * Configure HTTP behaviour at application startup
 */
export class HttpServerConfiguration {

    private readonly configuration: Configuration;
    private readonly parentContainer: Container;
    private readonly loggerFactory: LoggerFactory;
    private readonly expressApp: express.Application;

    public constructor(configuration: Configuration, parentContainer: Container, loggerFactory: LoggerFactory) {
        this.configuration = configuration;
        this.parentContainer = parentContainer;
        this.loggerFactory = loggerFactory;
        this.expressApp = express();
    }

    /*
     * Configure Express HTTP server behavior and wire up dependencies
     */
    public async configure(): Promise<void> {

        // Initialize routes
        const apiBasePath = '/investments';
        const allRoutes = `${apiBasePath}*_`;

        // Create Express middleware
        /*const childContainerMiddleware = new ChildContainerMiddleware(this.parentContainer);
        const loggerMiddleware = new LoggerMiddleware(this.loggerFactory);
        const authorizerMiddleware = new AuthorizerMiddleware();
        const customHeaderMiddleware = new CustomHeaderMiddleware(this.configuration.logging.apiName);*/
        const exceptionHandler = new UnhandledExceptionHandler(this.configuration.logging);

        // Register base dependencies
        new BaseCompositionRoot(this.parentContainer)
            .useOAuth(this.configuration.oauth)
            .withExtraClaimsProvider(new SampleExtraClaimsProvider())
            .withLogging(this.configuration.logging, this.loggerFactory)
            .withExceptionHandler(exceptionHandler)
            .withProxyConfiguration(this.configuration.api.useProxy, this.configuration.api.proxyUrl)
            .register();

        // Register the API's own dependencies
        CompositionRoot.registerDependencies(this.parentContainer);

        // Configure cross cutting concerns
        this.expressApp.set('etag', false);
        /*this.expressApp.use(allRoutes, childContainerMiddleware.execute);
        this.expressApp.use(allRoutes, loggerMiddleware.execute);
        this.expressApp.use(allRoutes, authorizerMiddleware.execute);
        this.expressApp.use(allRoutes, customHeaderMiddleware.execute);*/

        // Add decorator based routes
        console.log('*** USING ROUTES');
        this.expressApp.use(router);

        // Configure Express error middleware once routes have been created
        this.expressApp.use(allRoutes, exceptionHandler.execute);
    }

    /*
     * Start listening for requests
     */
    public async start(): Promise<void> {

        const port = this.configuration.api.port;
        if (this.configuration.api.sslCertificateFileName && this.configuration.api.sslCertificatePassword) {

            // Load certificate details
            const pfxFile = await fs.readFile(this.configuration.api.sslCertificateFileName);
            const serverOptions = {
                pfx: pfxFile,
                passphrase: this.configuration.api.sslCertificatePassword,
            };

            // Start listening over HTTPS
            const httpsServer = https.createServer(serverOptions, this.expressApp);
            httpsServer.listen(port, () => {
                console.log(`API is listening on HTTPS port ${port}`);
            });

        } else {

            // Otherwise listen over HTTP
            this.expressApp.listen(port, () => {
                console.log(`API is listening on HTTP port ${port}`);
            });
        }
    }
}
