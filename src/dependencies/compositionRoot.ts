import {Container} from 'inversify';
import {Configuration} from '../configuration/configuration.js';
import {OAuthConfiguration} from '../configuration/oauthConfiguration.js';
import {CompanyController} from '../logic/controllers/companyController.js';
import {CompanyRepository} from '../logic/repositories/companyRepository.js';
import {CompanyService} from '../logic/services/companyService.js';
import {UserInfoController} from '../logic/controllers/userInfoController.js';
import {UserRepository} from '../logic/repositories/userRepository.js';
import {ClaimsCache} from '../middleware/claims/claimsCache.js';
import {ExtraClaimsProvider} from '../middleware/claims/extraClaimsProvider.js';
import {LoggerFactory} from '../middleware/logging/loggerFactory.js';
import {AccessTokenValidator} from '../middleware/oauth/accessTokenValidator.js';
import {JwksRetriever} from '../middleware/oauth/jwksRetriever.js';
import {OAuthFilter} from '../middleware/oauth/oauthFilter.js';
import {HttpProxy} from '../utilities/httpProxy.js';
import {JsonFileReader} from '../utilities/jsonFileReader.js';
import {INTERFACES} from './interfaces.js';

/*
 * Dependency injection composition
 */
export class CompositionRoot {

    private readonly parentContainer: Container;
    private configuration!: Configuration;
    private loggerFactory!: LoggerFactory;
    private httpProxy!: HttpProxy;

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

        this.parentContainer.bind(HttpProxy)
            .toConstantValue(this.httpProxy);
    }

    /*
     * Register OAuth depencencies
     */
    private registerOAuthDependencies(): void {

        // Make the configuration injectable
        this.parentContainer.bind<OAuthConfiguration>(INTERFACES.OAuthConfiguration)
            .toConstantValue(this.configuration.oauth);

        // Register an object to validate JWT access tokens
        this.parentContainer.bind(AccessTokenValidator)
            .toSelf().inTransientScope();

        // The filter deals with finalizing the claims principal
        this.parentContainer.bind(OAuthFilter)
            .toSelf().inTransientScope();

        // Also register a singleton to cache token signing public keys
        this.parentContainer.bind(JwksRetriever)
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
        this.parentContainer.bind(ClaimsCache)
            .toConstantValue(claimsCache);

        // Register the extra claims provider
        this.parentContainer.bind(ExtraClaimsProvider)
            .toSelf().inRequestScope();
    }

    /*
     * Register objects used by application logic
     */
    private registerApplicationDependencies(): void {

        this.parentContainer.bind(CompanyController)
            .toSelf().inRequestScope();
        this.parentContainer.bind(UserInfoController)
            .toSelf().inRequestScope();

        this.parentContainer.bind(CompanyService)
            .toSelf().inTransientScope();
        this.parentContainer.bind(CompanyRepository)
            .toSelf().inTransientScope();
        this.parentContainer.bind(UserRepository)
            .toSelf().inTransientScope();
        this.parentContainer.bind(JsonFileReader)
            .toSelf().inTransientScope();
    }
}
