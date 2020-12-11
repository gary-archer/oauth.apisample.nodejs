import {NextFunction, Request, Response} from 'express';
import {injectable} from 'inversify';
import {CoreApiClaims} from '../claims/coreApiClaims';
import {BASETYPES} from '../dependencies/baseTypes';
import {ChildContainerHelper} from '../dependencies/childContainerHelper';
import {LogEntryImpl} from '../logging/logEntryImpl';
import {UnhandledExceptionHandler} from '../middleware/unhandledExceptionHandler';

/*
 * A base authorizer class that could be used for both Entry Point APIs and Microservices
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
            // Do authorization processing for this request, to get claims
            const claims = await this.execute(request);

            // Bind claims to this requests's child container so that they are injectable into business logic
            perRequestContainer.bind<CoreApiClaims>(BASETYPES.CoreApiClaims).toConstantValue(claims);

            // Log who called the API
            const logEntry = perRequestContainer.get<LogEntryImpl>(BASETYPES.LogEntry);
            logEntry.setIdentity(claims);

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
    protected abstract execute(request: Request): Promise<CoreApiClaims>;

    /*
     * Plumbing to ensure the this parameter is available
     */
    private _setupCallbacks(): void {
        this.authorizeRequestAndGetClaims = this.authorizeRequestAndGetClaims.bind(this);
    }
}
