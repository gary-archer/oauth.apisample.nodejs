import {Application} from 'express';
import {Container} from 'inversify';
import {FrameworkConfiguration} from '../configuration/frameworkConfiguration';
import {FRAMEWORKTYPES} from '../configuration/frameworkTypes';
import {UnhandledExceptionHandler} from '../errors/unhandledExceptionHandler';
import {UnhandledPromiseRejectionHandler} from '../errors/unhandledPromiseRejectionHandler';
import {ILogEntry} from '../logging/ilogEntry';
import {ILoggerFactory} from '../logging/iloggerFactory';
import {LoggerFactory} from '../logging/loggerFactory';
import {LoggerMiddleware} from '../logging/loggerMiddleware';
import {ChildContainerMiddleware} from '../middleware/childContainerMiddleware';
import {CustomHeaderMiddleware} from '../middleware/customHeaderMiddleware';
import {BaseAuthorizer} from '../security/baseAuthorizer';

/*
 * A builder style class to configure framework behaviour and to register its dependencies
 */
export class FrameworkInitialiser {

    // Injected properties
    private readonly _container: Container;
    private readonly _configuration: FrameworkConfiguration;
    private readonly _loggerFactory: ILoggerFactory;

    // Properties set via builder methods
    private _apiBasePath: string;

    // Calculated properties
    private _exceptionHandler!: UnhandledExceptionHandler;
    private _unhandledPromiseRejectionHandler!: UnhandledPromiseRejectionHandler;

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
    public withApiBasePath(apiBasePath: string): FrameworkInitialiser {

        this._apiBasePath = apiBasePath.toLowerCase();
        if (!apiBasePath.endsWith('/')) {
            apiBasePath += '/';
        }

        return this;
    }

    /*
     * Register dependencies
     */
    public register(): FrameworkInitialiser {

        // Create the unhandled exception handler for API requests
        this._exceptionHandler = new UnhandledExceptionHandler(this._configuration);

        // Create an object to handle unpromised rejection exceptions in Express middleware
        this._unhandledPromiseRejectionHandler = new UnhandledPromiseRejectionHandler(this._exceptionHandler);

        // Register framework dependencies as part of preparing the framework
        this._registerDependencies();
        return this;
    }

    /*
     * Set up cross cutting concerns as Express middleware, passing in singleton objects
     */
    public configureMiddleware(
        expressApp: Application,
        authorizer: BaseAuthorizer): FrameworkInitialiser {

        // First configure middleware to create a child container per request
        const childContainerMiddleware = new ChildContainerMiddleware(this._container);
        expressApp.use(`${this._apiBasePath}*`, childContainerMiddleware.create);

        // The first real middleware starts structured logging of API requests
        const logger = new LoggerMiddleware(this._loggerFactory);
        expressApp.use(`${this._apiBasePath}*`, logger.logRequest);

        // The second middleware manages authorization, and we need to catch unhandled promise exceptions
        expressApp.use(
            `${this._apiBasePath}*`,
            this._unhandledPromiseRejectionHandler.apply(authorizer.authorizeRequestAndGetClaims));

        // The third middleware supports non functional testing via headers
        const handler = new CustomHeaderMiddleware(this._configuration.apiName);
        expressApp.use(`${this._apiBasePath}*`, handler.processHeaders);
        return this;
    }

    /*
     * The unhandled exception middleware is configured last
     */
    public configureExceptionHandler(expressApp: Application): FrameworkInitialiser {
        expressApp.use(`${this._apiBasePath}*`, this._exceptionHandler.handleException);
        return this;
    }

    /*
     * Register framework dependencies used for aspects such as logging
     */
    private _registerDependencies(): void {

        /*** SINGLETONS ***/

        this._container.bind<FrameworkConfiguration>(FRAMEWORKTYPES.Configuration)
                       .toConstantValue(this._configuration);
        this._container.bind<ILoggerFactory>(FRAMEWORKTYPES.LoggerFactory)
                        .toConstantValue(this._loggerFactory);
        this._container.bind<UnhandledExceptionHandler>(FRAMEWORKTYPES.UnhandledExceptionHandler)
                        .toConstantValue(this._exceptionHandler);

        /*** PER REQUEST OBJECTS ***/

        this._container.bind<ILogEntry>(FRAMEWORKTYPES.ILogEntry)
                       .toDynamicValue(() =>
                            (this._loggerFactory as LoggerFactory).createLogEntry()).inRequestScope();
    }

    
}
