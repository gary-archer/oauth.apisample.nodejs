import cors from 'cors';
import express from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Container} from 'inversify';
import {InversifyExpressServer} from 'inversify-express-utils';
import url from 'url';
import {BaseCompositionRoot} from '../../plumbing/dependencies/baseCompositionRoot';
import {LoggerFactory} from '../../plumbing/logging/loggerFactory';
import {SampleApiClaims} from '../claims/sampleApiClaims';
import {SampleApiClaimsProvider} from '../claims/sampleApiClaimsProvider';
import {Configuration} from '../configuration/configuration';
import {CompositionRoot} from '../dependencies/compositionRoot';
import {WebStaticContent} from '../utilities/webStaticContent';

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

            // Allow cross origin requests from the SPA first, to prevent other middleware firing for OPTIONS requests
            const corsOptions = { origin: this._configuration.api.trustedOrigins };
            this._expressApp.use('/api/*', cors(corsOptions));

            // We must configure Express cross cutting concerns during this callback
            base.configureMiddleware(this._expressApp);

            // Configure how web static content is served
            this._configureWebStaticContent();
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

        // Use the web URL to determine the port
        const webUrl = url.parse(this._configuration.api.trustedOrigins[0]);

        // Calculate the port from the URL
        let port = 443;
        if (webUrl.port) {
            port = Number(webUrl.port);
        }

        // Load the certificate file from disk
        const pfxFile = await fs.readFile(`certs/${this._configuration.api.sslCertificateFileName}`);
        const sslOptions = {
            pfx: pfxFile,
            passphrase: this._configuration.api.sslCertificatePassword,
        };

        // Start listening on HTTPS
        const httpsServer = https.createServer(sslOptions, this._expressApp);
        httpsServer.listen(port, () => {

            // Show a startup message
            console.log(`Listening on HTTPS port ${port}`);
        });
    }

    /*
     * Handle requests for static web content
     */
    private _configureWebStaticContent(): void {

        const content = new WebStaticContent(this._expressApp);
        content.handleWebRequests();
    }
}
