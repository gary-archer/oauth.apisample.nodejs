import {NextFunction, Request, Response} from 'express';
import {Container} from 'inversify';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration.js';
import {ClaimsPrincipal} from '../claims/claimsPrincipal.js';
import {ClaimsReader} from '../claims/claimsReader.js';
import {ErrorCodes} from '../errors/errorCodes.js';
import {ErrorFactory} from '../errors/errorFactory.js';
import {OAuthFilter} from '../oauth/oauthFilter.js';

/*
 * The Node.js middleware for OAuth processing
 */
export class AuthenticationMiddleware {

    private readonly configuration: OAuthConfiguration;

    public constructor(configuration: OAuthConfiguration) {
        this.configuration = configuration;
        this.execute = this.execute.bind(this);
    }

    /*
     * Do the main work to process tokens, claims and log identity details
     */
    public async execute(request: Request, response: Response, next: NextFunction): Promise<void> {

        // Get objects
        const container = response.locals.container as Container;
        const filter =  container.get(OAuthFilter);

        // Run the filter and get the claims principal
        const claimsPrincipal = await filter.execute(request, response);

        // Bind claims to this requests's child container so that they are injectable into business logic
        container.bind(ClaimsPrincipal).toConstantValue(claimsPrincipal);

        // The example API requires the same scope for all endpoints, so enforce it here
        const scopes = ClaimsReader.getStringClaim(claimsPrincipal.getJwt(), 'scope').split(' ');
        if (scopes.indexOf(this.configuration.scope) === -1) {

            throw ErrorFactory.createClientError(
                403,
                ErrorCodes.insufficientScope,
                'The token does not contain sufficient scope for this API');
        }

        // On success, move on to the controller logic
        next();
    }
}
