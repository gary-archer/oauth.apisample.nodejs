import {Application} from 'express';
import {Container} from 'inversify';
import {getRawMetadata} from 'inversify-express-utils';
import {BASEFRAMEWORKTYPES, LogEntry} from '../../../framework-base';
import {APIFRAMEWORKTYPES} from '../configuration/apiFrameworkTypes';
import {FrameworkConfiguration} from '../configuration/frameworkConfiguration';
import {INTERNALTYPES} from '../configuration/internalTypes';
import {ApplicationExceptionHandler} from '../errors/applicationExceptionHandler';
import {LoggerFactory} from '../logging/loggerFactory';
import {RouteMetadataHandler} from '../logging/routeMetadataHandler';
import {CustomHeaderMiddleware} from '../middleware/customHeaderMiddleware';
import {LoggerMiddleware} from '../middleware/loggerMiddleware';
import {UnhandledExceptionHandler} from '../middleware/unhandledExceptionHandler';
import {BaseAuthorizer} from '../security/baseAuthorizer';

/*
 * A builder style class to configure framework behaviour and to register its dependencies
 */
export class FrameworkBuilder {

    private readonly _container: Container;
    private readonly _configuration: FrameworkConfiguration;
    private readonly _loggerFactory: LoggerFactory;

    private _apiBasePath: string;
    private _frameworkExceptionHandler!: UnhandledExceptionHandler;
    private _loggerMiddleware!: LoggerMiddleware;
    private _applicationExceptionHandler: ApplicationExceptionHandler;

    /*
     * Receive base details
     */
    public constructor(
        container: Container,
        configuration: FrameworkConfiguration,
        loggerFactory: LoggerFactory) {

        this._container = container;
        this._configuration = configuration;
        this._loggerFactory = loggerFactory;
        this._apiBasePath = '/';
        this._applicationExceptionHandler = new ApplicationExceptionHandler();
    }

    /*
     * Set the API base path, such as /api/
     */
    public withApiBasePath(apiBasePath: string): FrameworkBuilder {

        this._apiBasePath = apiBasePath.toLowerCase();
        if (!apiBasePath.endsWith('/')) {
            apiBasePath += '/';
        }

        return this;
    }

    /*
     * Allow an application handler to translate errors before the framework handler runs
     */
    public withApplicationExceptionHandler(appExceptionHandler: ApplicationExceptionHandler): FrameworkBuilder {
        this._applicationExceptionHandler = appExceptionHandler;
        return this;
    }

    /*
     * Do the main builder work of registering dependencies
     */
    public register(): FrameworkBuilder {

        // Create the unhandled exception handler for API requests
        this._frameworkExceptionHandler = new UnhandledExceptionHandler(
            this._configuration,
            this._applicationExceptionHandler);

        // Register framework dependencies as part of preparing the framework
        this._registerDependencies();
        return this;
    }

    /*
     * Set up framework cross cutting concerns as Express middleware, passing in singleton objects
     */
    public configureMiddleware(
        expressApp: Application,
        authorizer: BaseAuthorizer): FrameworkBuilder {

        // The first middleware starts structured logging of API requests
        this._loggerMiddleware = new LoggerMiddleware(this._loggerFactory);
        expressApp.use(`${this._apiBasePath}*`, this._loggerMiddleware.logRequest);

        // The second middleware manages authorization
        expressApp.use(`${this._apiBasePath}*`, authorizer.authorizeRequestAndGetClaims);

        // The third middleware supports non functional testing via headers
        const handler = new CustomHeaderMiddleware(this._configuration.apiName);
        expressApp.use(`${this._apiBasePath}*`, handler.processHeaders);
        return this;
    }

    /*
     * The unhandled exception middleware is configured after any non framework middleware
     */
    public configureExceptionHandler(expressApp: Application): FrameworkBuilder {
        expressApp.use(`${this._apiBasePath}*`, this._frameworkExceptionHandler.handleException);
        return this;
    }

    /*
     * Once Inversify routes have been configured we can call getRawMetadata to get route information
     * This enables our logging to calculate key logging fields throughout the whole middleware pipeline
     */
    public finalise(): void {
        const routeMetadataHandler = new RouteMetadataHandler(this._apiBasePath, getRawMetadata(this._container));
        this._loggerMiddleware.setRouteMetadataHandler(routeMetadataHandler);
    }

    /*
     * Register framework dependencies used for aspects such as logging
     */
    private _registerDependencies(): void {

        /*** SINGLETONS ***/

        this._container.bind<UnhandledExceptionHandler>(APIFRAMEWORKTYPES.UnhandledExceptionHandler)
                        .toConstantValue(this._frameworkExceptionHandler);
        this._container.bind<LoggerFactory>(APIFRAMEWORKTYPES.LoggerFactory)
                        .toConstantValue(this._loggerFactory);
        this._container.bind<FrameworkConfiguration>(INTERNALTYPES.Configuration)
                        .toConstantValue(this._configuration);

        /*** PER REQUEST OBJECTS ***/

        // Register a dummy value that is overridden by the logger middleware later
        this._container.bind<LogEntry>(BASEFRAMEWORKTYPES.LogEntry)
                       .toConstantValue({} as any);
    }
}
