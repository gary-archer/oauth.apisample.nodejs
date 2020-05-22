import {Application} from 'express';
import {Container} from 'inversify';
import {getRawMetadata} from 'inversify-express-utils';
import {LoggingConfiguration} from '../configuration/loggingConfiguration';
import {BASETYPES} from '../dependencies/baseTypes';
import {LogEntry} from '../logging/logEntry';
import {LoggerFactory} from '../logging/loggerFactory';
import {RouteMetadataHandler} from '../logging/routeMetadataHandler';
import {CustomHeaderMiddleware} from '../middleware/customHeaderMiddleware';
import {LoggerMiddleware} from '../middleware/loggerMiddleware';
import {UnhandledExceptionHandler} from '../middleware/unhandledExceptionHandler';
import {BaseAuthorizer} from '../oauth/baseAuthorizer';

/*
 * A builder style class to configure framework behaviour and to register its dependencies
 */
export class FrameworkBuilder {

    private readonly _container: Container;
    private readonly _configuration: LoggingConfiguration;
    private readonly _loggerFactory: LoggerFactory;

    private _apiBasePath: string;
    private _frameworkExceptionHandler!: UnhandledExceptionHandler;
    private _loggerMiddleware!: LoggerMiddleware;

    /*
     * Receive base details
     */
    public constructor(
        container: Container,
        configuration: LoggingConfiguration,
        loggerFactory: LoggerFactory) {

        this._container = container;
        this._configuration = configuration;
        this._loggerFactory = loggerFactory;
        this._apiBasePath = '/';
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
     * Do the main builder work of registering dependencies
     */
    public register(): FrameworkBuilder {

        // Create the unhandled exception handler for API requests
        this._frameworkExceptionHandler = new UnhandledExceptionHandler(this._configuration);

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

        // Singletons
        this._container.bind<UnhandledExceptionHandler>(BASETYPES.UnhandledExceptionHandler)
                        .toConstantValue(this._frameworkExceptionHandler);
        this._container.bind<LoggerFactory>(BASETYPES.LoggerFactory)
                        .toConstantValue(this._loggerFactory);
        this._container.bind<LoggingConfiguration>(BASETYPES.LoggingConfiguration)
                        .toConstantValue(this._configuration);

        // Register a per request dummy value that is overridden by the logger middleware later
        this._container.bind<LogEntry>(BASETYPES.LogEntry)
                       .toConstantValue({} as any);
    }
}
