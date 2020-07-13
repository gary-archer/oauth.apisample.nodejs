import cors from 'cors';
import express from 'express';
import fs from 'fs-extra';
import https, {ServerOptions} from 'https';
import {Container} from 'inversify';
import {InversifyExpressServer} from 'inversify-express-utils';
import tls from 'tls';
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

        // Load the certificate file from disk
        const pfxFile = await fs.readFile(`certs/${this._configuration.api.sslCertificateFileName}`);
        
        // http://nodejs.md/blog/https-server-with-multiple-domains-on-same-port-and-instance/
        const ctx = tls.createSecureContext({
            pfx: pfxFile,
            passphrase: this._configuration.api.sslCertificatePassword,
        })
        
        const serverOptions = {
            pfx: pfxFile,
            passphrase: this._configuration.api.sslCertificatePassword,
            SNICallback: (serverName: string, callback) => {
                
                if (serverName === 'api.mycompany.com' || serverName === 'web.mycompany.com') {
                    callback(null, ctx);
                }
            },
        } as ServerOptions;

        // Set listen options to enable us to run this at the same time as our API
        const listenOptions = {
            port: 443,
            path: '/api',
            exclusive: true,
        };

        // Start listening on HTTPS
        const httpsServer = https.createServer(serverOptions, this._expressApp);
        httpsServer.listen(listenOptions, () => {

            // Show a startup message
            console.log(`Listening on HTTPS port ${listenOptions.port}`);
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
