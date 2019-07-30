import {Container} from 'inversify';
import {FrameworkConfiguration} from '../configuration/frameworkConfiguration';
import {FRAMEWORKINTERNALTYPES} from '../configuration/frameworkInternalTypes';
import {FRAMEWORKPUBLICTYPES} from '../configuration/frameworkPublicTypes';
import {UnhandledExceptionHandler} from '../errors/unhandledExceptionHandler';
import {ICustomClaimsProvider} from '../extensibility/icustomClaimsProvider';
import {ILoggerFactory} from '../logging/iloggerFactory';
import {BaseAuthorizer} from '../security/baseAuthorizer';
import {ClaimsCache} from '../security/claimsCache';
import {ClaimsSupplier} from '../security/claimsSupplier';
import {CoreApiClaims} from '../security/coreApiClaims';
import {IssuerMetadata} from '../security/issuerMetadata';
import {OAuthAuthenticator} from '../security/oauthAuthenticator';
import {OAuthAuthorizer} from '../security/oauthAuthorizer';

/*
 * A builder style class for configuring OAuth security
 */
export class OAuthAuthorizerBuilder<TClaims extends CoreApiClaims> {

    private readonly _container: Container;
    private _claimsSupplier!: () => TClaims;
    private _customClaimsProviderSupplier!: () => ICustomClaimsProvider<TClaims>;
    private _unsecuredPaths: string[];

    public constructor(container: Container) {
        this._container = container;
        this._unsecuredPaths = [];
    }

    /*
     * Consumers of the builder class must provide a constructor function for creating claims
     */
    public withClaimsSupplier(construct: new () => TClaims): OAuthAuthorizerBuilder<TClaims> {
        this._claimsSupplier = () => new construct();
        return this;
    }

    /*
     * Consumers of the builder class can provide a constructor function for injecting custom claims
     */
    public withCustomClaimsProviderSupplier(construct: new () => ICustomClaimsProvider<TClaims>)
            : OAuthAuthorizerBuilder<TClaims> {

        this._customClaimsProviderSupplier = () => new construct();
        return this;
    }

    /*
     * Configure any API paths that return unsecured content, such as /api/unsecured
     */
    public addUnsecuredPath(unsecuredPath: string): OAuthAuthorizerBuilder<TClaims> {
        this._unsecuredPaths.push(unsecuredPath.toLowerCase());
        return this;
    }

    /*
     * Build and return the filter
     */
    public async register(): Promise<BaseAuthorizer> {

        // Get base framework dependencies
        const configuration = this._container.get<FrameworkConfiguration>(
            FRAMEWORKINTERNALTYPES.Configuration);
        const loggerFactory = this._container.get<ILoggerFactory>(
            FRAMEWORKPUBLICTYPES.ILoggerFactory);
        const exceptionHandler = this._container.get<UnhandledExceptionHandler>(
            FRAMEWORKPUBLICTYPES.UnhandledExceptionHandler);

        // Load Open Id Connect metadata
        const issuerMetadata = new IssuerMetadata(configuration);
        await issuerMetadata.load();

        // Create the cache used to store claims results after authentication processing
        // Use a constructor function as the first parameter, as required by TypeScript generics
        const claimsCache = ClaimsCache.createInstance<ClaimsCache<TClaims>>(
            ClaimsCache,
            configuration,
            loggerFactory);

        // Create an injectable object to enable the framework to create claims objects of a concrete type at runtime
        const claimsSupplier = ClaimsSupplier.createInstance<ClaimsSupplier<TClaims>, TClaims>(
            ClaimsSupplier,
            this._claimsSupplier,
            this._customClaimsProviderSupplier);

        // Register OAuth related dependencies
        this._registerDependencies(issuerMetadata, claimsCache, claimsSupplier);

        // Create an object to access the child container per request via the HTTP context
        return new OAuthAuthorizer<TClaims>(this._unsecuredPaths, exceptionHandler);
    }

    /*
     * Register dependencies when authentication is configured
     */
    private _registerDependencies(
        issuerMetadata: IssuerMetadata,
        claimsCache: ClaimsCache<TClaims>,
        claimsSupplier: ClaimsSupplier<TClaims>): void {

        /*** SINGLETONS ***/

        // Register security objects
        this._container.bind<IssuerMetadata>(FRAMEWORKINTERNALTYPES.IssuerMetadata)
                       .toConstantValue(issuerMetadata);
        this._container.bind<ClaimsCache<TClaims>>(FRAMEWORKINTERNALTYPES.ClaimsCache)
                       .toConstantValue(claimsCache);
        this._container.bind<ClaimsSupplier<TClaims>>(FRAMEWORKINTERNALTYPES.ClaimsSupplier)
                       .toConstantValue(claimsSupplier);

        /*** PER REQUEST OBJECTS ***/

        // Register the authenticator
        this._container.bind<OAuthAuthenticator>(FRAMEWORKINTERNALTYPES.OAuthAuthenticator)
                       .to(OAuthAuthenticator).inRequestScope();

        // Register a dummy value that is overridden by the authorizer middleware later
        this._container.bind<TClaims>(FRAMEWORKPUBLICTYPES.ApiClaims)
                       .toConstantValue({} as any);
    }
}
