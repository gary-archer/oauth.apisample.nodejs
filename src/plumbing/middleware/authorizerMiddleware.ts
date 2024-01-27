import {NextFunction, Request, Response} from 'express';
import {ClaimsPrincipal} from '../claims/claimsPrincipal.js';
import {ClaimsReader} from '../claims/claimsReader.js';
import {BASETYPES} from '../dependencies/baseTypes.js';
import {ChildContainerHelper} from '../dependencies/childContainerHelper.js';
import {LogEntryImpl} from '../logging/logEntryImpl.js';
import {UnhandledExceptionHandler} from '../middleware/unhandledExceptionHandler.js';
import {OAuthAuthorizer} from '../oauth/oauthAuthorizer.js';

/*
 * A middleware class as the entry point for OAuth authorization
 */
export class AuthorizerMiddleware {

    public constructor() {
        this._setupCallbacks();
    }

    /*
     * The entry point for implementing authorization
     */
    public async authorize(request: Request, response: Response, next: NextFunction): Promise<void> {

        // Get the container for this request
        const perRequestContainer = ChildContainerHelper.resolve(request);

        try {

            // Get objects
            const authorizer =  perRequestContainer.get<OAuthAuthorizer>(BASETYPES.OAuthAuthorizer);
            const logEntry = perRequestContainer.get<LogEntryImpl>(BASETYPES.LogEntry);

            // Run the authorizer then log identity details
            const claimsPrincipal = await authorizer.execute(request);
            logEntry.setIdentity(ClaimsReader.getStringClaim(claimsPrincipal.jwt, 'sub'));

            // Bind claims to this requests's child container so that they are injectable into business logic
            perRequestContainer.bind<ClaimsPrincipal>(BASETYPES.ClaimsPrincipal).toConstantValue(claimsPrincipal);

            // On success, move on to the controller logic
            next();

        } catch (e) {

            // Handle authorization exceptions
            const exceptionHandler = perRequestContainer.get<UnhandledExceptionHandler>(
                BASETYPES.UnhandledExceptionHandler);
            exceptionHandler.handleException(e, request, response, next);
        }
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private _setupCallbacks(): void {
        this.authorize = this.authorize.bind(this);
    }
}
