import {NextFunction, Request, Response} from 'express';
import {injectable} from 'inversify';
import {ApiClaims} from '../claims/apiClaims';
import {CustomClaims} from '../claims/customClaims';
import {CustomClaimsProvider} from '../claims/customClaimsProvider';
import {TokenClaims} from '../claims/tokenClaims';
import {UserInfoClaims} from '../claims/userInfoClaims';
import {BASETYPES} from '../dependencies/baseTypes';
import {ChildContainerHelper} from '../dependencies/childContainerHelper';
import {LogEntryImpl} from '../logging/logEntryImpl';
import {UnhandledExceptionHandler} from '../middleware/unhandledExceptionHandler';

/*
 * A base authorizer class that could be used for different types of security, all of which use claims
 */
@injectable()
export abstract class BaseAuthorizer {

    public constructor() {
        this._setupCallbacks();
    }

    /*
     * The entry point for implementing authorization
     */
    public async authorizeRequestAndGetClaims(request: Request, response: Response, next: NextFunction): Promise<void> {

        // Get the container for this request
        const perRequestContainer = ChildContainerHelper.resolve(request);

        try {

            // Get per request objects
            const logEntry = perRequestContainer.get<LogEntryImpl>(BASETYPES.LogEntry);
            const customClaimsProvider = perRequestContainer.get<CustomClaimsProvider>(BASETYPES.CustomClaimsProvider);

            // Do authorization processing for this request, to get claims
            const claims = await this.execute(request, customClaimsProvider, logEntry);

            // Bind claims objects to this requests's child container so that they are injectable into business logic
            perRequestContainer.bind<TokenClaims>(BASETYPES.TokenClaims).toConstantValue(claims.token);
            perRequestContainer.bind<UserInfoClaims>(BASETYPES.UserInfoClaims).toConstantValue(claims.userInfo);
            perRequestContainer.bind<CustomClaims>(BASETYPES.CustomClaims).toConstantValue(claims.custom);

            // Log caller identity details
            logEntry.setIdentity(claims.token);

            // On success, move on to the controller logic
            next();

        } catch (e) {

            // Handle authorization exceptions
            const exceptionHandler = perRequestContainer.get<UnhandledExceptionHandler>(
                BASETYPES.UnhandledExceptionHandler);
            exceptionHandler.handleException(e, request, response, next);
        }
    }

    // Concrete classes must override this
    protected abstract execute(
        request: Request,
        customClaimsProvider: CustomClaimsProvider,
        logEntry: LogEntryImpl): Promise<ApiClaims>;

    /*
     * Plumbing to ensure the this parameter is available
     */
    private _setupCallbacks(): void {
        this.authorizeRequestAndGetClaims = this.authorizeRequestAndGetClaims.bind(this);
    }
}
