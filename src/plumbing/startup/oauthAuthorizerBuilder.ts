import {Container} from 'inversify';
import {BASETYPES} from '../dependencies/baseTypes';
import {ClaimsCache} from '../claims/claimsCache';
import {ClaimsSupplier} from '../claims/claimsSupplier';
import {CoreApiClaims} from '../claims/coreApiClaims';
import {CustomClaimsProvider} from '../claims/customClaimsProvider';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {LoggerFactory} from '../logging/loggerFactory';
import {BaseAuthorizer} from '../oauth/baseAuthorizer';
import {IssuerMetadata} from '../oauth/issuerMetadata';
import {OAuthAuthenticator} from '../oauth/oauthAuthenticator';
import {OAuthAuthorizer} from '../oauth/oauthAuthorizer';

/*
 * A builder style class for configuring OAuth security
 */
export class OAuthAuthorizerBuilder<TClaims extends CoreApiClaims> {

    private readonly _container: Container;
    private readonly _configuration: OAuthConfiguration;
    private _claimsSupplier!: () => TClaims;
    private _customClaimsProviderSupplier!: () => CustomClaimsProvider<TClaims>;
    private _unsecuredPaths: string[];

    public constructor(container: Container, configuration: OAuthConfiguration) {
        this._container = container;
        this._configuration = configuration;
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
    public withCustomClaimsProviderSupplier(construct: new () => CustomClaimsProvider<TClaims>)
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
     * Register and return the authorizer
     */
    public async register(): Promise<BaseAuthorizer> {

        // Get base framework dependencies
        const loggerFactory = this._container.get<LoggerFactory>(BASETYPES.LoggerFactory);

        // Load Open Id Connect metadata
        const issuerMetadata = new IssuerMetadata(this._configuration);
        await issuerMetadata.load();

        // Create the cache used to store claims results after authentication processing
        // Use a constructor function as the first parameter, as required by TypeScript generics
        const claimsCache = ClaimsCache.createInstance<ClaimsCache<TClaims>>(
            ClaimsCache,
            this._configuration,
            loggerFactory);

        // Create an injectable object to enable the framework to create claims objects of a concrete type at runtime
        const claimsSupplier = ClaimsSupplier.createInstance<ClaimsSupplier<TClaims>, TClaims>(
            ClaimsSupplier,
            this._claimsSupplier,
            this._customClaimsProviderSupplier);

        // Register OAuth related dependencies
        this._registerDependencies(issuerMetadata, claimsCache, claimsSupplier);

        // Create an object to access the child container per request via the HTTP context
        return new OAuthAuthorizer<TClaims>(this._unsecuredPaths);
    }

    /*
     * Register dependencies when authentication is configured
     */
    private _registerDependencies(
        issuerMetadata: IssuerMetadata,
        claimsCache: ClaimsCache<TClaims>,
        claimsSupplier: ClaimsSupplier<TClaims>): void {

        /*** SINGLETONS ***/

        this._container.bind<OAuthConfiguration>(BASETYPES.OAuthConfiguration)
                       .toConstantValue(this._configuration);
        this._container.bind<IssuerMetadata>(BASETYPES.IssuerMetadata)
                       .toConstantValue(issuerMetadata);
        this._container.bind<ClaimsCache<TClaims>>(BASETYPES.ClaimsCache)
                       .toConstantValue(claimsCache);
        this._container.bind<ClaimsSupplier<TClaims>>(BASETYPES.ClaimsSupplier)
                       .toConstantValue(claimsSupplier);

        /*** PER REQUEST OBJECTS ***/

        this._container.bind<OAuthAuthenticator>(BASETYPES.OAuthAuthenticator)
                       .to(OAuthAuthenticator).inRequestScope();

        // Register a dummy value that is overridden by the authorizer middleware later
        this._container.bind<TClaims>(BASETYPES.CoreApiClaims)
                       .toConstantValue({} as any);
    }
}
