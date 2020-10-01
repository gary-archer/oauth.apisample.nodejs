import cors from 'cors';
import express from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Container} from 'inversify';
import {InversifyExpressServer} from 'inversify-express-utils';
import {BaseCompositionRoot} from '../../plumbing/dependencies/baseCompositionRoot';
import {LoggerFactory} from '../../plumbing/logging/loggerFactory';
import {SampleApiClaims} from '../claims/sampleApiClaims';
import {SampleApiClaimsProvider} from '../claims/sampleApiClaimsProvider';
import {Configuration} from '../configuration/configuration';
import {CompositionRoot} from '../dependencies/compositionRoot';

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
     * Configure behaviour before starting the server
     */
    public async configure(): Promise<void> {

        // Use common code and give it any data it needs
        const base = await new BaseCompositionRoot<SampleApiClaims>(this._container)
            .useApiBasePath('/api/')
            .useDiagnostics(this._configuration.logging, this._loggerFactory)
            .useOAuth(this._configuration.oauth)
            .useClaimsCaching(this._configuration.claims)
            .withClaimsSupplier(SampleApiClaims)
            .withCustomClaimsProviderSupplier(SampleApiClaimsProvider)
            .register();

        // Register the API's own dependencies
        CompositionRoot.registerDependencies(this._container);

        // Configure Inversify Express, which will register @controller attributes and set up controller autowiring
        new InversifyExpressServer(
            this._container,
            null,
            {rootPath: '/api/'},
            this._expressApp)
        .setConfig(() => {

            // Our API requests are not designed for caching
            this._expressApp.set('etag', false);

            // Allow cross origin requests from the SPA
            const corsOptions = { origin: this._configuration.api.webTrustedOrigins };
            this._expressApp.use('/api/*', cors(corsOptions));

            // We must configure Express cross cutting concerns during this callback
            base.configureMiddleware(this._expressApp);
        })
        .setErrorConfig(() => {

            // Inversify Express requires us to add the middleware for exception handling here
            base.configureExceptionHandler(this._expressApp);
        })
        .build();

        // Finalise once routes are avaiilable, which enables us to log path based fields later
        base.finalise();
    }

    /*
     * Start listening for requests
     */
    public async start(): Promise<void> {

        // Set HTTPS server options
        const pfxFile = await fs.readFile(`certs/${this._configuration.api.sslCertificateFileName}`);
        const serverOptions = {
            pfx: pfxFile,
            passphrase: this._configuration.api.sslCertificatePassword,
        };

        // Set listener options
        const listenOptions = {
            port: this._configuration.api.sslPort,
        };

        // Start listening
        const httpsServer = https.createServer(serverOptions, this._expressApp);
        httpsServer.listen(listenOptions, () => {

            // Render a startup message
            console.log(`API is listening on HTTPS port ${listenOptions.port}`);
        });
    }
}
