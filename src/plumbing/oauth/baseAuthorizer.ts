import {NextFunction, Request, Response} from 'express';
import {injectable} from 'inversify';
import {CoreApiClaims} from '../claims/coreApiClaims';
import {BASETYPES} from '../dependencies/baseTypes';
import {LogEntryImpl} from '../logging/logEntryImpl';
import {UnhandledExceptionHandler} from '../middleware/unhandledExceptionHandler';
import {ChildContainerHelper} from '../utilities/childContainerHelper';

/*
 * A base authorizer class that manages common plumbing
 */
@injectable()
export abstract class BaseAuthorizer {

    private readonly _unsecuredPaths: string[];

    public constructor(unsecuredPaths: string[]) {
        this._unsecuredPaths = unsecuredPaths;
        this._setupCallbacks();
    }

    /*
     * The entry point for implementing authorization
     */
    public async authorizeRequestAndGetClaims(request: Request, response: Response, next: NextFunction): Promise<void> {

        // Move to controller logic if this is an unsecured API operation
        if (this.isUnsecuredPath(request.originalUrl.toLowerCase())) {
            next();
            return;
        }

        // Get the container for this request
        const perRequestContainer = ChildContainerHelper.resolve(request);

        try {
            // Create the claims middleware for this request, then process the access token and get claims
            const claims = await this.execute(request);

            // Bind claims to this requests's child container so that they are injectable into business logic
            perRequestContainer.bind<CoreApiClaims>(BASETYPES.CoreApiClaims).toConstantValue(claims);

            // Log who called the API
            const logEntry = perRequestContainer.get<LogEntryImpl>(BASETYPES.LogEntry);
            logEntry.setIdentity(claims);

            // On success, move on to the controller logic
            next();

        } catch (e) {

            // Handle OAuth related exceptions
            const exceptionHandler = perRequestContainer.get<UnhandledExceptionHandler>(
                BASETYPES.UnhandledExceptionHandler);
            exceptionHandler.handleException(e, request, response, next);
        }
    }

    // Concrete classes must override this
    protected abstract async execute(request: Request): Promise<CoreApiClaims>;

    /*
     * Return true if this request does not use security
     */
    protected isUnsecuredPath(path: string): boolean {
        const found = this._unsecuredPaths.find((p) => path.startsWith(p));
        return !!found;
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private _setupCallbacks(): void {
        this.authorizeRequestAndGetClaims = this.authorizeRequestAndGetClaims.bind(this);
    }
}
