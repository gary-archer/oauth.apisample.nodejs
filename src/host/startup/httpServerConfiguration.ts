import express, {Request, Response, Router} from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Container} from 'inversify';
import {APPLICATIONTYPES} from '../../logic/dependencies/applicationTypes.js';
import {ExtraClaimsProviderImpl} from '../../logic/claims/extraClaimsProviderImpl.js';
import {LoggerFactory} from '../../plumbing/logging/loggerFactory.js';
import {AuthorizerMiddleware} from '../../plumbing/middleware/authorizerMiddleware.js';
import {ChildContainerMiddleware} from '../../plumbing/middleware/childContainerMiddleware.js';
import {CustomHeaderMiddleware} from '../../plumbing/middleware/customHeaderMiddleware.js';
import {LoggerMiddleware} from '../../plumbing/middleware/loggerMiddleware.js';
import {UnhandledExceptionHandler} from '../../plumbing/middleware/unhandledExceptionHandler.js';
import {RouteMetadata} from '../../plumbing/routes/routeMetadata.js';
import {UserInfoController} from '../controllers/userInfoController.js';
import {CompanyController} from '../controllers/companyController.js';
import {Configuration} from '../configuration/configuration.js';
import {CompositionRoot} from '../dependencies/compositionRoot.js';

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

        // Initialize routes data
        const apiBasePath = '/investments';
        const allRoutes = `${apiBasePath}/*_`;
        const routesMetadata = this.getApplicationRoutesMetadata(apiBasePath);

        // Create Express middleware
        const childContainerMiddleware = new ChildContainerMiddleware(this.parentContainer);
        const loggerMiddleware = new LoggerMiddleware(this.loggerFactory, routesMetadata);
        const authorizerMiddleware = new AuthorizerMiddleware();
        const customHeaderMiddleware = new CustomHeaderMiddleware(this.configuration.logging.apiName);
        const exceptionHandler = new UnhandledExceptionHandler(this.configuration.logging.apiName);

        // Register dependencies with the container
        new CompositionRoot(this.parentContainer)
            .addConfiguration(this.configuration)
            .addLogging(this.loggerFactory)
            .addProxyConfiguration(this.configuration.api.useProxy, this.configuration.api.proxyUrl)
            .addExtraClaimsProvider(new ExtraClaimsProviderImpl())
            .register();

        // Configure cross cutting concerns
        this.expressApp.set('etag', false);
        this.expressApp.use(allRoutes, childContainerMiddleware.execute);
        this.expressApp.use(allRoutes, loggerMiddleware.execute);
        this.expressApp.use(allRoutes, authorizerMiddleware.execute);
        this.expressApp.use(allRoutes, customHeaderMiddleware.execute);

        // Create application routes from the routes metadata
        this.expressApp.use(this.createApplicationRoutes(routesMetadata));

        // Configure Express error middleware once routes have been created
        this.expressApp.use(allRoutes, exceptionHandler.onNotFound);
        this.expressApp.use(allRoutes, exceptionHandler.onException);
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

    /*
     * Declare data about application routes, also used for request logging
     */
    private getApplicationRoutesMetadata(apiBasePath: string): RouteMetadata[] {

        return [
            {
                method: 'get',
                path: `${apiBasePath}/userinfo`,
                controller: APPLICATIONTYPES.UserInfoController,
                action: (c: UserInfoController) => c.getUserInfo,
            },
            {
                method: 'get',
                path: `${apiBasePath}/companies`,
                controller: APPLICATIONTYPES.CompanyController,
                action: (c: CompanyController) => c.getCompanyList,
            },
            {
                method: 'get',
                path: `${apiBasePath}/companies/:id/transactions`,
                controller: APPLICATIONTYPES.CompanyController,
                action: (c: CompanyController) => c.getCompanyTransactions,
            },
        ];
    }

    /*
     * Create an Express router with routes from route metadata
     */
    private createApplicationRoutes(routes: RouteMetadata[]): Router {

        const router = Router();

        routes.forEach((r) => {

            router[r.method](r.path, async (request: Request, response: Response) => {

                // Get the per-request container, which has access to reuqest-scoped objects that middleware creates
                const container = response.locals.container as Container;

                // Resolve the controller and its dependencies, which include the LogEntry and ClaimsPrincipal
                const instance = container.get(r.controller);

                // Then get the route handler method and run it
                const handler = r.action(instance);
                await handler(request, response);
            });
        });

        return router;
    }
}
