import {Application} from 'express';
import {Container} from 'inversify';
import {getRawMetadata} from 'inversify-express-utils';
import {ClaimsCache} from '../claims/claimsCache.js';
import {ClaimsPrincipal} from '../claims/claimsPrincipal.js';
import {ExtraClaimsProvider} from '../claims/extraClaimsProvider.js';
import {LoggingConfiguration} from '../configuration/loggingConfiguration.js';
import {OAuthConfiguration} from '../configuration/oauthConfiguration.js';
import {BASETYPES} from '../dependencies/baseTypes.js';
import {LogEntry} from '../logging/logEntry.js';
import {LoggerFactory} from '../logging/loggerFactory.js';
import {RouteMetadataHandler} from '../logging/routeMetadataHandler.js';
import {AuthorizerMiddleware} from '../middleware/authorizerMiddleware.js';
import {CustomHeaderMiddleware} from '../middleware/customHeaderMiddleware.js';
import {LoggerMiddleware} from '../middleware/loggerMiddleware.js';
import {UnhandledExceptionHandler} from '../middleware/unhandledExceptionHandler.js';
import {AccessTokenValidator} from '../oauth/accessTokenValidator.js';
import {JwksRetriever} from '../oauth/jwksRetriever.js';
import {OAuthFilter} from '../oauth/oauthFilter.js';
import {HttpProxy} from '../utilities/httpProxy.js';

/*
 * A class to create and register common cross cutting concerns
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
export class BaseCompositionRoot {

    private readonly _container: Container;
    private _apiBasePath?: string;
    private _oauthConfiguration?: OAuthConfiguration;
    private _extraClaimsProvider?: ExtraClaimsProvider;
    private _loggingConfiguration?: LoggingConfiguration;
    private _loggerFactory?: LoggerFactory;
    private _authorizerMiddleware?: AuthorizerMiddleware;
    private _loggerMiddleware?: LoggerMiddleware;
    private _exceptionHandler?: UnhandledExceptionHandler;
    private _httpProxy?: HttpProxy;

    public constructor(container: Container) {
        this._container = container;
    }

    /*
     * Set the API base path
     */
    public useApiBasePath(apiBasePath: string): BaseCompositionRoot {

        this._apiBasePath = apiBasePath.toLowerCase();
        if (!this._apiBasePath.endsWith('/')) {
            this._apiBasePath += '/';
        }

        return this;
    }

    /*
     * Indicate that we're using OAuth and receive the configuration
     */
    public useOAuth(oauthConfiguration: OAuthConfiguration): BaseCompositionRoot {
        this._oauthConfiguration = oauthConfiguration;
        return this;
    }

    /*
     * An object to provide extra claims when a new token is processed
     */
    public withExtraClaimsProvider(extraClaimsProvider: ExtraClaimsProvider): BaseCompositionRoot {
        this._extraClaimsProvider = extraClaimsProvider;
        return this;
    }

    /*
     * Receive the logging configuration so that we can create objects related to logging and error handling
     */
    public withLogging(
        loggingConfiguration: LoggingConfiguration,
        loggerFactory: LoggerFactory): BaseCompositionRoot {

        this._loggingConfiguration = loggingConfiguration;
        this._loggerFactory = loggerFactory;
        return this;
    }

    /*
     * Apply HTTP proxy details for outgoing OAuth calls if configured
     */
    public withProxyConfiguration(useProxy: boolean, proxyUrl: string): BaseCompositionRoot {

        this._httpProxy = new HttpProxy(useProxy, proxyUrl);
        return this;
    }

    /*
     * Do the main builder work of registering dependencies
     */
    public register(): BaseCompositionRoot {

        this._exceptionHandler = new UnhandledExceptionHandler(this._loggingConfiguration!);
        this._registerBaseDependencies();
        this._registerOAuthDependencies();
        this._registerClaimsDependencies();
        return this;
    }

    /*
     * Set up cross cutting concerns as Express middleware
     */
    public configureMiddleware(expressApp: Application): void {

        // The first middleware starts structured logging of API requests
        this._loggerMiddleware = new LoggerMiddleware(this._loggerFactory!);
        expressApp.use(`${this._apiBasePath}*`, this._loggerMiddleware.logRequest);

        // The second middleware manages authorization
        this._authorizerMiddleware = new AuthorizerMiddleware();
        expressApp.use(`${this._apiBasePath}*`, this._authorizerMiddleware.authorize);

        // The third middleware supports non functional testing via headers
        const handler = new CustomHeaderMiddleware(this._loggingConfiguration!.apiName);
        expressApp.use(`${this._apiBasePath}*`, handler.processHeaders);
    }

    /*
     * With Inversify Express the exception middleware must be configured after other middleware
     */
    public configureExceptionHandler(expressApp: Application): BaseCompositionRoot {
        expressApp.use(`${this._apiBasePath}*`, this._exceptionHandler!.handleException);
        return this;
    }

    /*
     * Once Inversify routes have been configured we can call getRawMetadata to get route information
     * This enables our logging to calculate key logging fields throughout the whole middleware pipeline
     */
    public finalise(): void {
        const routeMetadataHandler = new RouteMetadataHandler(this._apiBasePath!, getRawMetadata(this._container));
        this._loggerMiddleware!.setRouteMetadataHandler(routeMetadataHandler);
    }

    /*
     * Register dependencies for logging and error handling
     */
    private _registerBaseDependencies(): void {

        // Singletons
        this._container.bind<UnhandledExceptionHandler>(BASETYPES.UnhandledExceptionHandler)
            .toConstantValue(this._exceptionHandler!);
        this._container.bind<LoggerFactory>(BASETYPES.LoggerFactory)
            .toConstantValue(this._loggerFactory!);
        this._container.bind<LoggingConfiguration>(BASETYPES.LoggingConfiguration)
            .toConstantValue(this._loggingConfiguration!);
        this._container.bind<HttpProxy>(BASETYPES.HttpProxy)
            .toConstantValue(this._httpProxy!);

        // Register a per request dummy value that is overridden by the logger middleware later
        this._container.bind<LogEntry>(BASETYPES.LogEntry)
            .toConstantValue({} as any);
    }

    /*
     * Register OAuth depencencies
     */
    private _registerOAuthDependencies(): void {

        // Make the configuration injectable
        this._container.bind<OAuthConfiguration>(BASETYPES.OAuthConfiguration)
            .toConstantValue(this._oauthConfiguration!);

        // A class to validate JWT access tokens
        this._container.bind<AccessTokenValidator>(BASETYPES.AccessTokenValidator)
            .to(AccessTokenValidator).inRequestScope();

        // The filter deals with finalizing the claims principal
        this._container.bind<OAuthFilter>(BASETYPES.OAuthFilter)
            .to(OAuthFilter).inRequestScope();

        // Also register a singleton to cache token signing public keys
        this._container.bind<JwksRetriever>(BASETYPES.JwksRetriever)
            .toConstantValue(new JwksRetriever(this._oauthConfiguration!, this._httpProxy!));
    }

    /*
     * Register claims related depencencies
     */
    private _registerClaimsDependencies(): void {

        // Register the singleton cache
        const claimsCache = new ClaimsCache(
            this._oauthConfiguration!.claimsCacheTimeToLiveMinutes,
            this._extraClaimsProvider!,
            this._loggerFactory!);
        this._container.bind<ClaimsCache>(BASETYPES.ClaimsCache)
            .toConstantValue(claimsCache);

        // Register the extra claims provider
        this._container.bind<ExtraClaimsProvider>(BASETYPES.ExtraClaimsProvider)
            .toConstantValue(this._extraClaimsProvider!);

        // Register dummy per request claims that are overridden later by the authorizer middleware
        this._container.bind<ClaimsPrincipal>(BASETYPES.ClaimsPrincipal)
            .toConstantValue({} as any);
    }
}
