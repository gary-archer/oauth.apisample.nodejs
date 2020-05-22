import {Application} from 'express';
import {Container} from 'inversify';
import {getRawMetadata} from 'inversify-express-utils';
import {ClaimsCache} from '../claims/claimsCache';
import {ClaimsSupplier} from '../claims/claimsSupplier';
import {CoreApiClaims} from '../claims/coreApiClaims';
import {CustomClaimsProvider} from '../claims/customClaimsProvider';
import {LoggingConfiguration} from '../configuration/loggingConfiguration';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {BASETYPES} from '../dependencies/baseTypes';
import {LogEntry} from '../logging/logEntry';
import {LoggerFactory} from '../logging/loggerFactory';
import {RouteMetadataHandler} from '../logging/routeMetadataHandler';
import {CustomHeaderMiddleware} from '../middleware/customHeaderMiddleware';
import {LoggerMiddleware} from '../middleware/loggerMiddleware';
import {UnhandledExceptionHandler} from '../middleware/unhandledExceptionHandler';
import {IssuerMetadata} from '../oauth/issuerMetadata';
import {OAuthAuthenticator} from '../oauth/oauthAuthenticator';
import {OAuthAuthorizer} from '../oauth/oauthAuthorizer';

/*
 * A class to create and register dependencies for base / plumbing code
 */
export class BaseCompositionRoot<TClaims extends CoreApiClaims> {

    // Injected properties
    private readonly _container: Container;
    private readonly _loggingConfiguration: LoggingConfiguration;
    private readonly _oauthConfiguration: OAuthConfiguration;
    private readonly _loggerFactory: LoggerFactory;

    // Calculated properties
    private _apiBasePath: string;
    private _unsecuredPaths: string[];
    private _claimsSupplier!: () => TClaims;
    private _customClaimsProviderSupplier!: () => CustomClaimsProvider<TClaims>;
    private _exceptionHandler!: UnhandledExceptionHandler;
    private _authorizer!: OAuthAuthorizer<TClaims>
    private _loggerMiddleware!: LoggerMiddleware;

    /*
     * Receive base details
     */
    public constructor(
        container: Container,
        loggingConfiguration: LoggingConfiguration,
        oauthConfiguration: OAuthConfiguration,
        loggerFactory: LoggerFactory) {

        this._container = container;
        this._loggingConfiguration = loggingConfiguration;
        this._oauthConfiguration = oauthConfiguration;
        this._loggerFactory = loggerFactory;
        this._apiBasePath = '/';
        this._unsecuredPaths = [];
    }

    /*
     * Set the API base path, such as /api/
     */
    public withApiBasePath(apiBasePath: string): BaseCompositionRoot<TClaims> {

        this._apiBasePath = apiBasePath.toLowerCase();
        if (!apiBasePath.endsWith('/')) {
            apiBasePath += '/';
        }

        return this;
    }

    /*
     * Configure any API paths that return unsecured content, such as /api/unsecured
     */
    public addUnsecuredPath(unsecuredPath: string): BaseCompositionRoot<TClaims> {
        this._unsecuredPaths.push(unsecuredPath.toLowerCase());
        return this;
    }

    /*
     * Consumers of the builder class must provide a constructor function for creating claims
     */
    public withClaimsSupplier(construct: new () => TClaims): BaseCompositionRoot<TClaims> {
        this._claimsSupplier = () => new construct();
        return this;
    }

    /*
     * Consumers of the builder class can provide a constructor function for injecting custom claims
     */
    public withCustomClaimsProviderSupplier(construct: new () => CustomClaimsProvider<TClaims>)
            : BaseCompositionRoot<TClaims> {

        this._customClaimsProviderSupplier = () => new construct();
        return this;
    }

    /*
     * Do the main builder work of registering dependencies
     */
    public async register(): Promise<void> {

        // Register base dependencies
        this._exceptionHandler = new UnhandledExceptionHandler(this._loggingConfiguration);
        this._registerLoggingDependencies();

        // Register OAuth specific dependencies
        await this._registerOAuthDependencies();
    }

    /*
     * Set up cross cutting concerns as Express middleware
     */
    public configureMiddleware(expressApp: Application): void {

        // The first middleware starts structured logging of API requests
        this._loggerMiddleware = new LoggerMiddleware(this._loggerFactory);
        expressApp.use(`${this._apiBasePath}*`, this._loggerMiddleware.logRequest);

        // The second middleware manages authorization
        expressApp.use(`${this._apiBasePath}*`, this._authorizer.authorizeRequestAndGetClaims);

        // The third middleware supports non functional testing via headers
        const handler = new CustomHeaderMiddleware(this._loggingConfiguration.apiName);
        expressApp.use(`${this._apiBasePath}*`, handler.processHeaders);
    }

    /*
     * With Inversify Express the exception middleware must be configured after other middleware
     */
    public configureExceptionHandler(expressApp: Application): BaseCompositionRoot<TClaims> {
        expressApp.use(`${this._apiBasePath}*`, this._exceptionHandler.handleException);
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
     * Register dependencies for logging and error handling
     */
    private _registerLoggingDependencies(): void {

        // Singletons
        this._container.bind<UnhandledExceptionHandler>(BASETYPES.UnhandledExceptionHandler)
                        .toConstantValue(this._exceptionHandler);
        this._container.bind<LoggerFactory>(BASETYPES.LoggerFactory)
                        .toConstantValue(this._loggerFactory);
        this._container.bind<LoggingConfiguration>(BASETYPES.LoggingConfiguration)
                        .toConstantValue(this._loggingConfiguration);

        // Register a per request dummy value that is overridden by the logger middleware later
        this._container.bind<LogEntry>(BASETYPES.LogEntry)
                       .toConstantValue({} as any);
    }

    /*
     * Register OAuth related depencencies
     */
    public async _registerOAuthDependencies(): Promise<void> {

        // Load Open Id Connect metadata
        const issuerMetadata = new IssuerMetadata(this._oauthConfiguration);
        await issuerMetadata.load();

        // Create the cache used to store claims results after authentication processing
        // Use a constructor function as the first parameter, as required by TypeScript generics
        const claimsCache = ClaimsCache.createInstance<ClaimsCache<TClaims>>(
            ClaimsCache,
            this._oauthConfiguration,
            this._loggerFactory);

        // Create an injectable object to enable run time creation of claims objects of a specific type
        const claimsSupplier = ClaimsSupplier.createInstance<ClaimsSupplier<TClaims>, TClaims>(
            ClaimsSupplier,
            this._claimsSupplier,
            this._customClaimsProviderSupplier);

        // Create the authorizer, as the entry point to validating tokens and looking up claims
        this._authorizer = new OAuthAuthorizer<TClaims>(this._unsecuredPaths);

        // Singletons
        this._container.bind<OAuthConfiguration>(BASETYPES.OAuthConfiguration)
                       .toConstantValue(this._oauthConfiguration);
        this._container.bind<IssuerMetadata>(BASETYPES.IssuerMetadata)
                       .toConstantValue(issuerMetadata);
        this._container.bind<ClaimsCache<TClaims>>(BASETYPES.ClaimsCache)
                       .toConstantValue(claimsCache);
        this._container.bind<ClaimsSupplier<TClaims>>(BASETYPES.ClaimsSupplier)
                       .toConstantValue(claimsSupplier);

        // Per request objects
        this._container.bind<OAuthAuthenticator>(BASETYPES.OAuthAuthenticator)
                       .to(OAuthAuthenticator).inRequestScope();

        // Register a dummy claims value that is overridden by the authorizer middleware later
        this._container.bind<TClaims>(BASETYPES.CoreApiClaims)
                       .toConstantValue({} as any);
    }
}
