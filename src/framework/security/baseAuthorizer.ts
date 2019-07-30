import {NextFunction, Request, Response} from 'express';
import {injectable} from 'inversify';
import {UnhandledExceptionHandler} from '../errors/unhandledExceptionHandler';
import {LogEntry} from '../logging/logEntry';
import {CoreApiClaims} from './coreApiClaims';

/*
 * A base authorizer class that manages common plumbing
 */
@injectable()
export abstract class BaseAuthorizer {

    private readonly _unsecuredPaths: string[];
    private readonly _exceptionHandler: UnhandledExceptionHandler;

    public constructor(unsecuredPaths: string[], exceptionHandler: UnhandledExceptionHandler) {
        this._unsecuredPaths = unsecuredPaths;
        this._exceptionHandler = exceptionHandler;
        this._setupCallbacks();
    }

    /*
     * The entry point for implementing authorization
     */
    public async authorizeRequestAndGetClaims(request: Request, response: Response, next: NextFunction): Promise<void> {

        if (this.isUnsecuredPath(request.originalUrl.toLowerCase())) {

            // Move to controller logic if this is an unsecured API operation
            next();

        } else {

            try {
                // Get the log entry for this API request
                const logEntry = LogEntry.getCurrent(request);

                // Create the claims middleware for this request, then process the access token and get claims
                const claims = await this.execute(request);

                // Log who called the API
                logEntry.setIdentity(claims);

                // On success, move on to the controller logic
                next();

            } catch (e) {

                // We must not let unhandled promises escape
                this._exceptionHandler.handleException(e, request, response, next);
            }
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
