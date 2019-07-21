import {Container} from 'inversify';
import {FRAMEWORKTYPES} from '../configuration/frameworkTypes';
import {BaseAuthorizer} from '../security/baseAuthorizer';
import {CoreApiClaims} from '../security/coreApiClaims';
import {HeaderAuthenticator} from '../security/headerAuthenticator';
import {HeaderAuthorizer} from '../security/headerAuthorizer';
import {HttpContextAccessor} from '../utilities/httpContextAccessor';
import {FrameworkInitialiser} from './frameworkInitialiser';

/*
 * A builder style class for configuring header based authorization
 */
export class HeaderAuthorizerBuilder {

    // Injected dependencies
    private readonly _container: Container;

    // Properties set via builder methods
    private _unsecuredPaths: string[];

    /*
     * Receive dependencies
     */
    public constructor(framework: FrameworkInitialiser) {

        // Get properties from the framework
        [this._container] = framework.getProperties();

        // Initialise other properties
        this._unsecuredPaths = [];
    }

    /*
     * Configure any API paths that return unsecured content, such as /api/unsecured
     */
    public addUnsecuredPath(unsecuredPath: string): HeaderAuthorizerBuilder {
        this._unsecuredPaths.push(unsecuredPath.toLowerCase());
        return this;
    }

    /*
     * Build and return the filter
     */
    public build(): BaseAuthorizer {

        // Register OAuth related dependencies
        this._registerDependencies();

        // Create an object to access the child container per request via the HTTP context
        return new HeaderAuthorizer(this._unsecuredPaths, new HttpContextAccessor());
    }

    /*
     * Register dependencies when authentication is configured
     */
    private _registerDependencies(): void {

        // Register the authenticator
        this._container.bind<HeaderAuthenticator>(FRAMEWORKTYPES.HeaderAuthenticator)
                       .to(HeaderAuthenticator).inRequestScope();

        // Register dummy per request values that are overridden by middleware later
        this._container.bind<CoreApiClaims>(FRAMEWORKTYPES.ApiClaims)
                       .toConstantValue({} as any);
    }
}
