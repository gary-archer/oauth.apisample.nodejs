import {Application} from 'express';
import {Container} from 'inversify';
import {getRawMetadata} from 'inversify-express-utils';
import jwksRsa, {JwksClient} from 'jwks-rsa';
import {ClaimsCache} from '../claims/claimsCache';
import {CustomClaimsProvider} from '../claims/customClaimsProvider';
import {CustomClaims} from '../claims/customClaims';
import {TokenClaims} from '../claims/tokenClaims';
import {UserInfoClaims} from '../claims/userInfoClaims';
import {LoggingConfiguration} from '../configuration/loggingConfiguration';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {BASETYPES} from '../dependencies/baseTypes';
import {LogEntry} from '../logging/logEntry';
import {LoggerFactory} from '../logging/loggerFactory';
import {RouteMetadataHandler} from '../logging/routeMetadataHandler';
import {CustomHeaderMiddleware} from '../middleware/customHeaderMiddleware';
import {LoggerMiddleware} from '../middleware/loggerMiddleware';
import {UnhandledExceptionHandler} from '../middleware/unhandledExceptionHandler';
import {OAuthAuthenticator} from '../oauth/oauthAuthenticator';
import {ClaimsCachingAuthorizer} from '../oauth/claimsCachingAuthorizer';
import {IntrospectionValidator} from '../oauth/token-validation/introspectionValidator';
import {JwtValidator} from '../oauth/token-validation/jwtValidator';
import {TokenValidator} from '../oauth/token-validation/tokenValidator';
import {BaseAuthorizer} from '../security/baseAuthorizer';

/*
 * A class to create and register common cross cutting concerns
 */
export class BaseCompositionRoot {

    private readonly _container: Container;
    private _apiBasePath?: string;
    private _unsecuredPaths: string[];
    private _loggingConfiguration?: LoggingConfiguration;
    private _loggerFactory?: LoggerFactory;
    private _loggerMiddleware?: LoggerMiddleware;
    private _exceptionHandler?: UnhandledExceptionHandler;
    private _oauthConfiguration?: OAuthConfiguration;
    private _authorizer?: BaseAuthorizer;
    private _customClaimsProvider?: CustomClaimsProvider;
    private _useProxy?: boolean;
    private _proxyUrl?: string;

    public constructor(container: Container) {
        this._container = container;
        this._unsecuredPaths = [];
    }

    /*
     * Set the API base path, such as /api/
     */
    public useApiBasePath(apiBasePath: string): BaseCompositionRoot {

        this._apiBasePath = apiBasePath.toLowerCase();
        if (!this._apiBasePath.endsWith('/')) {
            this._apiBasePath += '/';
        }

        return this;
    }

    /*
     * Allow some paths to bypass OAuth security
     */
    public addUnsecuredPath(unsecuredPath: string): BaseCompositionRoot {
        this._unsecuredPaths.push(unsecuredPath);
        return this;
    }

    /*
     * Receive the logging configuration so that we can create objects related to logging and error handling
     */
    public useLogging(
        loggingConfiguration: LoggingConfiguration,
        loggerFactory: LoggerFactory): BaseCompositionRoot {

        this._loggingConfiguration = loggingConfiguration;
        this._loggerFactory = loggerFactory;
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
     * A class to provide custom claims when a new token is processed
     */
    public withCustomClaimsProvider(customClaimsProvider: CustomClaimsProvider): BaseCompositionRoot {
        this._customClaimsProvider = customClaimsProvider;
        return this;
    }

    /*
     * Apply HTTP proxy details for outgoing OAuth calls if configured
     */
    public withProxyConfiguration(useProxy: boolean, proxyUrl: string): BaseCompositionRoot {

        this._useProxy = useProxy;
        this._proxyUrl = proxyUrl;
        return this;
    }

    /*
     * Do the main builder work of registering dependencies
     */
    public async register(): Promise<BaseCompositionRoot> {

        // Register dependencies for logging
        this._exceptionHandler = new UnhandledExceptionHandler(this._loggingConfiguration!);
        this._registerLoggingDependencies();

        // Register OAuth specific dependencies for Entry Point APIs
        if (this._oauthConfiguration) {
            await this._registerOAuthDependencies();
        }

        // Register claims dependencies for all APIs
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
        expressApp.use(`${this._apiBasePath}*`, this._authorizer!.authorizeRequestAndGetClaims);

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
    private _registerLoggingDependencies(): void {

        // Singletons
        this._container.bind<UnhandledExceptionHandler>(BASETYPES.UnhandledExceptionHandler)
            .toConstantValue(this._exceptionHandler!);
        this._container.bind<LoggerFactory>(BASETYPES.LoggerFactory)
            .toConstantValue(this._loggerFactory!);
        this._container.bind<LoggingConfiguration>(BASETYPES.LoggingConfiguration)
            .toConstantValue(this._loggingConfiguration!);

        // Register a per request dummy value that is overridden by the logger middleware later
        this._container.bind<LogEntry>(BASETYPES.LogEntry)
            .toConstantValue({} as any);
    }

    /*
     * Register OAuth related depencencies
     */
    private async _registerOAuthDependencies(): Promise<void> {

        // Create the authorizer, which provides the overall algorithm for handling requests
        if (this._oauthConfiguration!.strategy === 'claims-caching') {

            // Create an authorizer for Cognito, which looks up claims within the API
            // This is used when the Authorization Server does not support custom claims in the desired manner
            this._authorizer = new ClaimsCachingAuthorizer(this._customClaimsProvider!);

        } else {

            // Create a standard authorizer, which receives all claims from the access token
            // This is used when the Authorization Server has advanced capabilities to get claims separately per API
            // this._authorizer = new ClaimsCachingAuthorizer(this._customClaimsProvider);
            throw new Error('not yet implemented');
        }

        // Allow anonymous access when needed
        this._authorizer.setUnsecuredPaths(this._unsecuredPaths);

        // Singletons
        this._container.bind<OAuthConfiguration>(BASETYPES.OAuthConfiguration)
            .toConstantValue(this._oauthConfiguration!);

        // The authenticator object is created per request
        this._container.bind<OAuthAuthenticator>(BASETYPES.OAuthAuthenticator)
            .to(OAuthAuthenticator).inRequestScope();

        // Wire up the token validator depending on the strategy
        if (this._oauthConfiguration!.tokenValidationStrategy === 'introspection') {

            // The introspection validator is created per request
            this._container.bind<TokenValidator>(BASETYPES.TokenValidator)
                .to(IntrospectionValidator).inRequestScope();

        } else {

            // The JWKS client caches JWKS keys so is a singleton
            const jwksClient = jwksRsa({
                jwksUri: this._oauthConfiguration!.jwksEndpoint,
                proxy: this._useProxy ? this._proxyUrl : undefined,
            });
            this._container.bind<JwksClient>(BASETYPES.JwksClient)
                .toConstantValue(jwksClient);

            // The JWT validator is created per request
            this._container.bind<TokenValidator>(BASETYPES.TokenValidator)
                .to(JwtValidator).inRequestScope();
        }
    }

    /*
     * Register claims related depencencies
     */
    private _registerClaimsDependencies(): void {

        if (this._oauthConfiguration!.strategy === 'claims-caching') {

            // Register the singleton cache used to store claims results after authentication processing
            const claimsCache = new ClaimsCache(
                this._oauthConfiguration!.claimsCacheTimeToLiveMinutes,
                this._customClaimsProvider!,
                this._loggerFactory!);

            this._container.bind<ClaimsCache>(BASETYPES.ClaimsCache)
                .toConstantValue(claimsCache);

            // The point of claims caching is to use custom claims from the API's own data, so register a provider
            this._container.bind<CustomClaimsProvider>(BASETYPES.CustomClaimsProvider)
                .toConstantValue(this._customClaimsProvider!);
        }

        // Register dummy claims values that are overridden later by the authorizer middleware
        this._container.bind<TokenClaims>(BASETYPES.TokenClaims)
            .toConstantValue({} as any);
        this._container.bind<UserInfoClaims>(BASETYPES.UserInfoClaims)
            .toConstantValue({} as any);
        this._container.bind<CustomClaims>(BASETYPES.CustomClaims)
            .toConstantValue({} as any);
    }
}
