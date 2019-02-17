import {NextFunction, Request, Response} from 'express';
import {Configuration} from '../configuration/configuration';
import {BasicApiClaims} from '../entities/BasicApiClaims';
import {Authenticator} from '../framework/oauth/authenticator';
import {ClaimsCache} from '../framework/oauth/claimsCache';
import {ClaimsMiddleware} from '../framework/oauth/claimsMiddleware';
import {IssuerMetadata} from '../framework/oauth/issuerMetadata';
import {ResponseWriter} from '../framework/utilities/responseWriter';
import {BasicApiClaimsProvider} from '../logic/basicApiClaimsProvider';

/*
 * The entry point for authorization
 */
export class AuthorizationHandler {

    /*
     * Dependencies
     */
    private _apiConfig: Configuration;
    private _claimsCache: ClaimsCache;
    private _issuerMetadata: IssuerMetadata;

    /*
     * API construction
     */
    public constructor(apiConfig: Configuration) {
        this._apiConfig = apiConfig;
        this._claimsCache = new ClaimsCache(this._apiConfig.oauth);
        this._issuerMetadata = new IssuerMetadata(this._apiConfig.oauth);
        this._setupCallbacks();
    }

    /*
     * Load metadata once at application startup
     */
    public async initialize(): Promise<void> {
        await this._issuerMetadata.load();
    }

    /*
     * The entry point for authorization and claims handling
     */
    public async authorizeRequest(
        request: Request,
        response: Response,
        next: NextFunction): Promise<void> {

        // Create authorization related classes on every API request
        const authenticator = new Authenticator(this._apiConfig.oauth, this._issuerMetadata.metadata);
        const customClaimsProvider = new BasicApiClaimsProvider();
        const middleware = new ClaimsMiddleware(this._claimsCache, authenticator, customClaimsProvider);

        // Try to get the access token and create empty claims
        const accessToken = this._readAccessToken(request);
        const claims = new BasicApiClaims();

        // Call the middleware to do the work
        const success = await middleware.authorizeRequestAndSetClaims(accessToken, claims);
        if (success) {

            // On success, set claims against the request context and move on to the controller logic
            response.locals.claims = claims;
            next();

        } else {

            // Non success responses mean a missing, expired or invalid token, and we will return 401
            // Note that any failures will be thrown as exceptions and will result in a 500 response
            ResponseWriter.writeInvalidTokenResponse(response);
        }
    }

    /*
     * Try to read the token from the authorization header
     */
    private _readAccessToken(request: Request): string | null {

        const authorizationHeader = request.header('authorization');
        if (authorizationHeader) {
            const parts = authorizationHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                return parts[1];
            }
        }

        return null;
    }

    /*
     * Set up async callbacks
     */
    private _setupCallbacks(): void {
        this.authorizeRequest = this.authorizeRequest.bind(this);
    }
}
