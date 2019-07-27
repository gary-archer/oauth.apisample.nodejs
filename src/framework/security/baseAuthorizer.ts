import {NextFunction, Request, Response} from 'express';
import {injectable} from 'inversify';
import {LogEntry} from '../logging/logEntry';
import {CoreApiClaims} from './coreApiClaims';

/*
 * A base authorizer class that manages common plumbing
 */
@injectable()
export abstract class BaseAuthorizer {

    // Injected dependencies
    private readonly _unsecuredPaths: string[];

    /*
     * Receive dependencies
     */
    public constructor(unsecuredPaths: string[]) {
        this._unsecuredPaths = unsecuredPaths;
        this._unsecuredPaths = [];
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

            // Get the log entry for this API request
            const logEntry = LogEntry.getCurrent(request);

            // Create the claims middleware for this request, then process the access token and get claims
            const claims = await this.execute(request);

            // Log who called the API
            logEntry.setIdentity(claims);

            // On success, move on to the controller logic
            next();
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
