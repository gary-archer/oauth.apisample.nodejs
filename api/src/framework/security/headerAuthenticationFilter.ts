import {Request} from 'express';
import {FRAMEWORKTYPES} from '../configuration/frameworkTypes';
import {HttpContextAccessor} from '../utilities/httpContextAccessor';
import {BaseAuthenticationFilter} from './baseAuthenticationFilter';
import {CoreApiClaims} from './coreApiClaims';
import {HeaderAuthenticator} from './headerAuthenticator';

/*
 * A simple authentication filter for private subnet APIs, to receive claims via headers
 */
export class HeaderAuthenticationFilter extends BaseAuthenticationFilter {

    /*
     * Receive dependencies
     */
    public constructor(unsecuredPaths: string[], contextAccessor: HttpContextAccessor) {
        super(unsecuredPaths, contextAccessor);
    }

    /*
     * Do the work to process headers and extracting claims
     */
    protected async execute(request: Request): Promise<CoreApiClaims> {

        // Get the child container for this HTTP request
        const container = super.getHttpContext(request).container;

        // Resolve the authenticator class and ask it to do the work
        const authenticator = container.get<HeaderAuthenticator>(FRAMEWORKTYPES.HeaderAuthenticator);
        const claims = await authenticator.authorizeRequestAndGetClaims(request);

        // Register the claims against this requests's child container
        // This enables the claims object to be injected into business logic classes
        container.bind<CoreApiClaims>(FRAMEWORKTYPES.ApiClaims).toConstantValue(claims);
        return claims;
    }
}
