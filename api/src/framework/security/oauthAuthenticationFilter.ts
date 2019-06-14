import {Request} from 'express';
import {FRAMEWORKTYPES} from '../configuration/frameworkTypes';
import {HttpContextAccessor} from '../utilities/httpContextAccessor';
import {BaseAuthenticationFilter} from './baseAuthenticationFilter';
import {ClaimsMiddleware} from './claimsMiddleware';
import {CoreApiClaims} from './coreApiClaims';

/*
 * The Express entry point for authentication processing
 */
export class OAuthAuthenticationFilter<TClaims extends CoreApiClaims> extends BaseAuthenticationFilter {

    /*
     * Receive dependencies
     */
    public constructor(unsecuredPaths: string[], contextAccessor: HttpContextAccessor) {
        super(unsecuredPaths, contextAccessor);
    }

    /*
     * Do the OAuth processing via the middleware class
     */
    protected async execute(request: Request): Promise<CoreApiClaims> {

        // Get the child container for this HTTP request
        const container = super.getHttpContext(request).container;

        // Resolve the claims middleware class and ask it to do the work
        const middleware = container.get<ClaimsMiddleware<TClaims>>(FRAMEWORKTYPES.ClaimsMiddleware);
        const claims = await middleware.authorizeRequestAndGetClaims(request);

        // Register the claims against this requests's child container
        // This enables the claims object to be injected into business logic classes
        container.bind<TClaims>(FRAMEWORKTYPES.ApiClaims).toConstantValue(claims);
        return claims;
    }
}
