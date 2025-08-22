import {NextFunction, Request, Response} from 'express';
import {Container} from 'inversify';
import {ClaimsPrincipal} from '../claims/claimsPrincipal.js';
import {ClaimsReader} from '../claims/claimsReader.js';
import {CustomClaimNames} from '../claims/customClaimNames.js';
import {BASETYPES} from '../dependencies/baseTypes.js';
import {BaseErrorCodes} from '../errors/baseErrorCodes.js';
import {ErrorFactory} from '../errors/errorFactory.js';
import {LogEntryImpl} from '../logging/logEntryImpl.js';
import {OAuthFilter} from '../oauth/oauthFilter.js';

/*
 * A custom authentication filter to take finer control over processing of tokens and claims
 */
export class AuthenticationMiddleware {

    private readonly requiredScope: string;

    public constructor(requiredScope: string) {
        this.requiredScope = requiredScope;
        this.execute = this.execute.bind(this);
    }

    /*
     * Do the main work to process tokens, claims and log identity details
     */
    public async execute(request: Request, response: Response, next: NextFunction): Promise<void> {

        // Get objects
        const container = response.locals.container as Container;
        const filter =  container.get<OAuthFilter>(BASETYPES.OAuthFilter);
        const logEntry = container.get<LogEntryImpl>(BASETYPES.LogEntry);

        // Run the filter and get the claims principal
        const claimsPrincipal = await filter.execute(request, response);

        // Include selected token details in audit logs
        const userId = ClaimsReader.getStringClaim(claimsPrincipal.getJwt(), 'sub');
        const scope = ClaimsReader.getStringClaim(claimsPrincipal.getJwt(), 'scope');
        const loggedClaims = {
            managerId: ClaimsReader.getStringClaim(claimsPrincipal.getJwt(), CustomClaimNames.managerId),
            role: ClaimsReader.getStringClaim(claimsPrincipal.getJwt(), CustomClaimNames.role),
        };
        logEntry.setIdentity(userId, scope.split(' '), loggedClaims);

        // Bind claims to this requests's child container so that they are injectable into business logic
        container.bind<ClaimsPrincipal>(BASETYPES.ClaimsPrincipal).toConstantValue(claimsPrincipal);

        // The sample API requires the same scope for all endpoints, so enforce it here
        // In AWS this is a URL value of the form https://api.authsamples.com/investments
        const scopes = ClaimsReader.getStringClaim(claimsPrincipal.getJwt(), 'scope').split(' ');
        if (scopes.indexOf(this.requiredScope) === -1) {

            throw ErrorFactory.createClientError(
                403,
                BaseErrorCodes.insufficientScope,
                'The token does not contain sufficient scope for this API');
        }

        // On success, move on to the controller logic
        next();
    }
}
