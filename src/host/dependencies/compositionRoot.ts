import {Container} from 'inversify';
import {APPLICATIONTYPES} from '../../logic/dependencies/applicationTypes.js';
import {CompanyRepository} from '../../logic/repositories/companyRepository.js';
import {UserRepository} from '../../logic/repositories/userRepository.js';
import {CompanyService} from '../../logic/services/companyService.js';
import {JsonFileReader} from '../../logic/utilities/jsonFileReader.js';
import {ClaimsCache} from '../../plumbing/claims/claimsCache.js';
import {ExtraClaimsProvider} from '../../plumbing/claims/extraClaimsProvider.js';
import {OAuthConfiguration} from '../../plumbing/configuration/oauthConfiguration.js';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes.js';
import {LoggerFactory} from '../../plumbing/logging/loggerFactory.js';
import {AccessTokenValidator} from '../../plumbing/oauth/accessTokenValidator.js';
import {JwksRetriever} from '../../plumbing/oauth/jwksRetriever.js';
import {OAuthFilter} from '../../plumbing/oauth/oauthFilter.js';
import {HttpProxy} from '../../plumbing/utilities/httpProxy.js';
import {Configuration} from '../configuration/configuration.js';
import {CompanyController} from '../controllers/companyController.js';
import {UserInfoController} from '../controllers/userInfoController.js';

/*
 * Dependency injection composition
 */
export class CompositionRoot {

    private readonly parentContainer: Container;
    private configuration!: Configuration;
    private loggerFactory!: LoggerFactory;
    private httpProxy!: HttpProxy;
    private extraClaimsProvider!: ExtraClaimsProvider;

    /*
     * Receive the DI container
     */
    public constructor(parentContainer: Container) {
        this.parentContainer = parentContainer;
    }

    /*
     * Receive configuration
     */
    public addConfiguration(configuration: Configuration): CompositionRoot {
        this.configuration = configuration;
        return this;
    }

    /*
     * Receive logging objects
     */
    public addLogging(loggerFactory: LoggerFactory): CompositionRoot {
        this.loggerFactory = loggerFactory;
        return this;
    }

    /*
     * Store an object to manage HTTP debugging
     */
    public addProxyConfiguration(useProxy: boolean, proxyUrl: string): CompositionRoot {

        this.httpProxy = new HttpProxy(useProxy, proxyUrl);
        return this;
    }

    /*
     * Receive an object that customizes the claims principal with extra authorization values
     */
    public addExtraClaimsProvider(extraClaimsProvider: ExtraClaimsProvider): CompositionRoot {
        this.extraClaimsProvider = extraClaimsProvider;
        return this;
    }

    /*
     * Do the main builder work of registering dependencies
     */
    public register(): CompositionRoot {

        this.registerBaseDependencies();
        this.registerOAuthDependencies();
        this.registerClaimsDependencies();
        this.registerApplicationDependencies();
        return this;
    }

    /*
     * Register dependencies for logging, error handling and an HTTP proxy library
     */
    private registerBaseDependencies(): void {

        this.parentContainer.bind<HttpProxy>(BASETYPES.HttpProxy)
            .toConstantValue(this.httpProxy);
    }

    /*
     * Register OAuth depencencies
     */
    private registerOAuthDependencies(): void {

        // Make the configuration injectable
        this.parentContainer.bind<OAuthConfiguration>(BASETYPES.OAuthConfiguration)
            .toConstantValue(this.configuration.oauth);

        // Register an object to validate JWT access tokens
        this.parentContainer.bind<AccessTokenValidator>(BASETYPES.AccessTokenValidator)
            .to(AccessTokenValidator).inTransientScope();

        // The filter deals with finalizing the claims principal
        this.parentContainer.bind<OAuthFilter>(BASETYPES.OAuthFilter)
            .to(OAuthFilter).inTransientScope();

        // Also register a singleton to cache token signing public keys
        this.parentContainer.bind<JwksRetriever>(BASETYPES.JwksRetriever)
            .toConstantValue(new JwksRetriever(this.configuration.oauth, this.httpProxy));
    }

    /*
     * Register claims related depencencies
     */
    private registerClaimsDependencies(): void {

        // Register the singleton cache
        const claimsCache = new ClaimsCache(
            this.configuration.oauth.claimsCacheTimeToLiveMinutes,
            this.loggerFactory);
        this.parentContainer.bind<ClaimsCache>(BASETYPES.ClaimsCache)
            .toConstantValue(claimsCache);

        // Register the extra claims provider
        this.parentContainer.bind<ExtraClaimsProvider>(BASETYPES.ExtraClaimsProvider)
            .toConstantValue(this.extraClaimsProvider);
    }

    /*
     * Register objects used by application logic
     */
    private registerApplicationDependencies(): void {

        this.parentContainer.bind<CompanyController>(APPLICATIONTYPES.CompanyController)
            .to(CompanyController).inRequestScope();
        this.parentContainer.bind<UserInfoController>(APPLICATIONTYPES.UserInfoController)
            .to(UserInfoController).inRequestScope();

        this.parentContainer.bind<CompanyService>(APPLICATIONTYPES.CompanyService)
            .to(CompanyService).inTransientScope();
        this.parentContainer.bind<CompanyRepository>(APPLICATIONTYPES.CompanyRepository)
            .to(CompanyRepository).inTransientScope();
        this.parentContainer.bind<UserRepository>(APPLICATIONTYPES.UserRepository)
            .to(UserRepository).inTransientScope();
        this.parentContainer.bind<JsonFileReader>(APPLICATIONTYPES.JsonFileReader)
            .to(JsonFileReader).inTransientScope();
    }
}
