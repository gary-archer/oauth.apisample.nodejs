import {Container} from 'inversify';
import {ClaimsCache} from '../claims/claimsCache.js';
import {ClaimsPrincipal} from '../claims/claimsPrincipal.js';
import {ExtraClaimsProvider} from '../claims/extraClaimsProvider.js';
import {LoggingConfiguration} from '../configuration/loggingConfiguration.js';
import {OAuthConfiguration} from '../configuration/oauthConfiguration.js';
import {BASETYPES} from '../dependencies/baseTypes.js';
import {LogEntry} from '../logging/logEntry.js';
import {LoggerFactory} from '../logging/loggerFactory.js';
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

    private readonly container: Container;
    private oauthConfiguration?: OAuthConfiguration;
    private extraClaimsProvider?: ExtraClaimsProvider;
    private loggingConfiguration?: LoggingConfiguration;
    private loggerFactory?: LoggerFactory;
    private exceptionHandler?: UnhandledExceptionHandler;
    private httpProxy?: HttpProxy;

    public constructor(container: Container) {
        this.container = container;
    }

    /*
     * Indicate that we're using OAuth and receive the configuration
     */
    public useOAuth(oauthConfiguration: OAuthConfiguration): BaseCompositionRoot {
        this.oauthConfiguration = oauthConfiguration;
        return this;
    }

    /*
     * An object to provide extra claims when a new token is processed
     */
    public withExtraClaimsProvider(extraClaimsProvider: ExtraClaimsProvider): BaseCompositionRoot {
        this.extraClaimsProvider = extraClaimsProvider;
        return this;
    }

    /*
     * Receive the logging configuration so that we can create objects related to logging and error handling
     */
    public withLogging(
        loggingConfiguration: LoggingConfiguration,
        loggerFactory: LoggerFactory): BaseCompositionRoot {

        this.loggingConfiguration = loggingConfiguration;
        this.loggerFactory = loggerFactory;
        return this;
    }

    /*
     * Receive the unhandled exception handler
     */
    public withExceptionHandler(exceptionHandler: UnhandledExceptionHandler): BaseCompositionRoot {

        this.exceptionHandler = exceptionHandler;
        return this;
    }

    /*
     * Apply HTTP proxy details for outgoing OAuth calls if configured
     */
    public withProxyConfiguration(useProxy: boolean, proxyUrl: string): BaseCompositionRoot {

        this.httpProxy = new HttpProxy(useProxy, proxyUrl);
        return this;
    }

    /*
     * Do the main builder work of registering dependencies
     */
    public register(): BaseCompositionRoot {

        this.registerBaseDependencies();
        this.registerOAuthDependencies();
        this.registerClaimsDependencies();
        return this;
    }

    /*
     * Register dependencies for logging and error handling
     */
    private registerBaseDependencies(): void {

        // Singletons
        this.container.bind<UnhandledExceptionHandler>(BASETYPES.UnhandledExceptionHandler)
            .toConstantValue(this.exceptionHandler!);
        this.container.bind<LoggerFactory>(BASETYPES.LoggerFactory)
            .toConstantValue(this.loggerFactory!);
        this.container.bind<LoggingConfiguration>(BASETYPES.LoggingConfiguration)
            .toConstantValue(this.loggingConfiguration!);
        this.container.bind<HttpProxy>(BASETYPES.HttpProxy)
            .toConstantValue(this.httpProxy!);

        // Register a per request dummy value that is overridden by the logger middleware later
        this.container.bind<LogEntry>(BASETYPES.LogEntry)
            .toConstantValue({} as any);
    }

    /*
     * Register OAuth depencencies
     */
    private registerOAuthDependencies(): void {

        // Make the configuration injectable
        this.container.bind<OAuthConfiguration>(BASETYPES.OAuthConfiguration)
            .toConstantValue(this.oauthConfiguration!);

        // A class to validate JWT access tokens
        this.container.bind<AccessTokenValidator>(BASETYPES.AccessTokenValidator)
            .to(AccessTokenValidator).inRequestScope();

        // The filter deals with finalizing the claims principal
        this.container.bind<OAuthFilter>(BASETYPES.OAuthFilter)
            .to(OAuthFilter).inRequestScope();

        // Also register a singleton to cache token signing public keys
        this.container.bind<JwksRetriever>(BASETYPES.JwksRetriever)
            .toConstantValue(new JwksRetriever(this.oauthConfiguration!, this.httpProxy!));
    }

    /*
     * Register claims related depencencies
     */
    private registerClaimsDependencies(): void {

        // Register the singleton cache
        const claimsCache = new ClaimsCache(
            this.oauthConfiguration!.claimsCacheTimeToLiveMinutes,
            this.extraClaimsProvider!,
            this.loggerFactory!);
        this.container.bind<ClaimsCache>(BASETYPES.ClaimsCache)
            .toConstantValue(claimsCache);

        // Register the extra claims provider
        this.container.bind<ExtraClaimsProvider>(BASETYPES.ExtraClaimsProvider)
            .toConstantValue(this.extraClaimsProvider!);

        // Register dummy per request claims that are overridden later by the authorizer middleware
        this.container.bind<ClaimsPrincipal>(BASETYPES.ClaimsPrincipal)
            .toConstantValue({} as any);
    }
}
