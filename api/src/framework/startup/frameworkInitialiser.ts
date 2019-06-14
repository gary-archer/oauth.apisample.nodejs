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
import {BaseAuthenticationFilter} from '../security/baseAuthenticationFilter';
import {CustomHeaderMiddleware} from '../utilities/customHeaderMiddleware';
import {HttpContextAccessor} from '../utilities/httpContextAccessor';

/*
 * A builder style class to configure framework behaviour and to register its dependencies
 */
export class FrameworkInitialiser {

    // Injected properties
    private readonly _container: Container;
    private readonly _configuration: FrameworkConfiguration;
    private readonly _loggerFactory: ILoggerFactory;
    private readonly _httpContextAccessor: HttpContextAccessor;

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
        this._httpContextAccessor = new HttpContextAccessor();
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
     * Prepare the framework
     */
    public prepare(): FrameworkInitialiser {

        // Create the unhandled exception handler for API requests
        this._exceptionHandler = new UnhandledExceptionHandler(this._configuration, this._httpContextAccessor);

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
        authenticationFilter: BaseAuthenticationFilter): FrameworkInitialiser {

        // The first middleware starts structured logging of API requests
        const logger = new LoggerMiddleware(this._httpContextAccessor, this._loggerFactory);
        expressApp.use(
            `${this._apiBasePath}*`,
            this._unhandledPromiseRejectionHandler.apply(logger.logRequest));

        // The second middleware manages authentication and claims
        expressApp.use(
            `${this._apiBasePath}*`,
            this._unhandledPromiseRejectionHandler.apply(authenticationFilter.authorizeRequestAndGetClaims));

        // The third middleware provides non functional testing behaviour
        const handler = new CustomHeaderMiddleware(this._configuration.apiName);
        expressApp.use(
            `${this._apiBasePath}*`,
            this._unhandledPromiseRejectionHandler.apply(handler.processHeaders));

        return this;
    }

    /*
     * Express error middleware is configured last, to catch unhandled exceptions
     */
    public configureExceptionHandler(expressApp: Application): FrameworkInitialiser {

        expressApp.use(`${this._apiBasePath}*`, this._exceptionHandler.handleException);
        return this;
    }

    /*
     * Return properties to other framework classes before the container is initialised
     */
    public getProperties(): [Container, FrameworkConfiguration, ILoggerFactory] {
        return [this._container, this._configuration, this._loggerFactory];
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

        /*** PER REQUEST OBJECTS ***/

        this._container.bind<ILogEntry>(FRAMEWORKTYPES.ILogEntry)
                       .toDynamicValue((ctx) =>
                            (this._loggerFactory as LoggerFactory).createLogEntry()).inRequestScope();
    }
}
