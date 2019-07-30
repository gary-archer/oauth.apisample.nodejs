import {Application} from 'express';
import {Container} from 'inversify';
import {FrameworkConfiguration} from '../configuration/frameworkConfiguration';
import {FRAMEWORKINTERNALTYPES} from '../configuration/frameworkInternalTypes';
import {FRAMEWORKPUBLICTYPES} from '../configuration/frameworkPublicTypes';
import {UnhandledExceptionHandler} from '../errors/unhandledExceptionHandler';
import {ILogEntry} from '../logging/ilogEntry';
import {ILoggerFactory} from '../logging/iloggerFactory';
import {LoggerMiddleware} from '../logging/loggerMiddleware';
import {CustomHeaderMiddleware} from '../middleware/customHeaderMiddleware';
import {BaseAuthorizer} from '../security/baseAuthorizer';

/*
 * A builder style class to configure framework behaviour and to register its dependencies
 */
export class FrameworkBuilder {

    // Injected properties
    private readonly _container: Container;
    private readonly _configuration: FrameworkConfiguration;
    private readonly _loggerFactory: ILoggerFactory;

    // Calculated properties
    private _apiBasePath: string;
    private _exceptionHandler!: UnhandledExceptionHandler;

    /*
     * Receive base details
     */
    public constructor(
        container: Container,
        configuration: FrameworkConfiguration,
        loggerFactory: ILoggerFactory) {

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
     * Register dependencies
     */
    public register(): FrameworkBuilder {

        // Create the unhandled exception handler for API requests
        this._exceptionHandler = new UnhandledExceptionHandler(this._configuration);

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
        const logger = new LoggerMiddleware(this._loggerFactory);
        expressApp.use(`${this._apiBasePath}*`, logger.logRequest);

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
        expressApp.use(`${this._apiBasePath}*`, this._exceptionHandler.handleException);
        return this;
    }

    /*
     * Register framework dependencies used for aspects such as logging
     */
    private _registerDependencies(): void {

        /*** SINGLETONS ***/

        this._container.bind<UnhandledExceptionHandler>(FRAMEWORKPUBLICTYPES.UnhandledExceptionHandler)
                        .toConstantValue(this._exceptionHandler);
        this._container.bind<ILoggerFactory>(FRAMEWORKPUBLICTYPES.ILoggerFactory)
                        .toConstantValue(this._loggerFactory);
        this._container.bind<FrameworkConfiguration>(FRAMEWORKINTERNALTYPES.Configuration)
                        .toConstantValue(this._configuration);

        /*** PER REQUEST OBJECTS ***/

        // Register a dummy value that is overridden by the logger middleware later
        this._container.bind<ILogEntry>(FRAMEWORKPUBLICTYPES.ILogEntry)
                       .toConstantValue({} as any);
    }
}
