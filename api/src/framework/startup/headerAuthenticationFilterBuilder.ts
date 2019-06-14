import {Container} from 'inversify';
import {FrameworkConfiguration} from '../configuration/frameworkConfiguration';
import {FRAMEWORKTYPES} from '../configuration/frameworkTypes';
import {BaseAuthenticationFilter} from '../security/baseAuthenticationFilter';
import {CoreApiClaims} from '../security/coreApiClaims';
import {HeaderAuthenticationFilter} from '../security/headerAuthenticationFilter';
import {HeaderAuthenticator} from '../security/headerAuthenticator';
import {HttpContextAccessor} from '../utilities/httpContextAccessor';
import {FrameworkInitialiser} from './frameworkInitialiser';

/*
 * A builder style class for configuring header authentication
 */
export class HeaderAuthenticationFilterBuilder {

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
    public addUnsecuredPath(unsecuredPath: string): HeaderAuthenticationFilterBuilder {
        this._unsecuredPaths.push(unsecuredPath.toLowerCase());
        return this;
    }

    /*
     * Build and return the filter
     */
    public build(): BaseAuthenticationFilter {

        // Register OAuth related dependencies
        this._registerDependencies();

        // Create an object to access the child container per request via the HTTP context
        return new HeaderAuthenticationFilter(this._unsecuredPaths, new HttpContextAccessor());
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
