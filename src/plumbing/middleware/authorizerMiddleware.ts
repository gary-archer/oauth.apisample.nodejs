import {NextFunction, Request, Response} from 'express';
import {Container} from 'inversify';
import {ClaimsPrincipal} from '../claims/claimsPrincipal.js';
import {ClaimsReader} from '../claims/claimsReader.js';
import {CustomClaimNames} from '../claims/customClaimNames.js';
import {BASETYPES} from '../dependencies/baseTypes.js';
import {LogEntryImpl} from '../logging/logEntryImpl.js';
import {OAuthFilter} from '../oauth/oauthFilter.js';

/*
 * A middleware class as the entry point for OAuth authorization
 */
export class AuthorizerMiddleware {

    /*
     * The entry point for implementing authorization
     */
    public async execute(request: Request, response: Response, next: NextFunction): Promise<void> {

        // Get objects
        const container = response.locals.container as Container;
        const filter =  container.get<OAuthFilter>(BASETYPES.OAuthFilter);
        const logEntry = container.get<LogEntryImpl>(BASETYPES.LogEntry);

        // Run the authorizer
        const claimsPrincipal = await filter.execute(request, response);

        // Include token details in audit logs
        const userId = ClaimsReader.getStringClaim(claimsPrincipal.getJwt(), 'sub');
        const scope = ClaimsReader.getStringClaim(claimsPrincipal.getJwt(), 'scope');
        const claims = {
            managerId: ClaimsReader.getStringClaim(claimsPrincipal.getJwt(), CustomClaimNames.managerId),
            role: ClaimsReader.getStringClaim(claimsPrincipal.getJwt(), CustomClaimNames.role),
        };
        logEntry.setIdentity(userId, scope.split(' '), claims);

        // Bind claims to this requests's child container so that they are injectable into business logic
        container.bind<ClaimsPrincipal>(BASETYPES.ClaimsPrincipal).toConstantValue(claimsPrincipal);

        // On success, move on to the controller logic
        next();
    }
}
