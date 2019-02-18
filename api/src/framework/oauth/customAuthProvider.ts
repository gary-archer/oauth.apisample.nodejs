import {NextFunction, Request, Response} from 'express';
import {injectable} from 'inversify';
import {interfaces} from 'inversify-express-utils';
import {BasicApiClaims} from '../../entities/BasicApiClaims';
import {BasicApiClaimsProvider} from '../../logic/basicApiClaimsProvider';
import {ClientError} from '../errors/clientError';
import {ResponseWriter} from '../utilities/responseWriter';
import {Authenticator} from './authenticator';
import {ClaimsCache} from './claimsCache';
import {ClaimsMiddleware} from './claimsMiddleware';
import {CustomPrincipal} from './customPrincipal';
import {IssuerMetadata} from './issuerMetadata';
import {OAuthConfiguration} from './oauthConfiguration';

/*
 * A singleton to act as the Express entry point for authentication processing
 */
@injectable()
export class CustomAuthProvider implements interfaces.AuthProvider {

    // Fields created during initialization
    private _configuration: OAuthConfiguration;
    private _issuerMetadata: IssuerMetadata;
    private _claimsCache: ClaimsCache;

    /*
     * Do one time initialization
     */
    public async initialize(configuration: OAuthConfiguration): Promise<CustomAuthProvider> {

        // Store input
        this._configuration = configuration;

        // Load metadata
        this._issuerMetadata = new IssuerMetadata(this._configuration);
        await this._issuerMetadata.load();

        // Create the claims cache
        this._claimsCache = new ClaimsCache(this._configuration);
        return this;
    }

    /*
     * The entry point for implementing authorization
     */
    public async getUser(request: Request, response: Response, next: NextFunction): Promise<interfaces.Principal> {

        // Check we have an API request
        if (request.originalUrl.startsWith('/api/') && request.method !== 'OPTIONS') {

            try {
                // If so then authorize it
                const claims = await this._authorizeApiRequest(request, response);
                if (claims) {

                    // On success, set claims against the request context and move on to the controller logic
                    return new CustomPrincipal(claims);

                } else {

                    // TODO: 400 errors are logged OK, but response has no CORS headers
                    // Also get "Can't set headers after they are sent" error trying to write response

                    // If we could not get claims then pass a 401 error to the next middleware
                    const error = new ClientError(401, 'unauthorized', 'Missing, invalid or expired access token');
                    next(error);
                }
            } catch (e) {

                // If there was an exception, pass it to the next middleware
                next(e);

                // TODO: 500 errors are output OK, but without CORS headers
                // Understand what inversify express does with the error

                // Authorization errors are returned as a 500 repsonse
                // const clientError = ErrorHandler.handleError(e);
                // ResponseWriter.writeObjectResponse(response, clientError.statusCode, clientError.toResponseFormat());
            }
        }
    }

    /*
     * Do the authorization work and return claims on success
     */
    private async _authorizeApiRequest(request: Request, response: Response): Promise<BasicApiClaims | null> {

        // Create authorization related classes on every API request
        const authenticator = new Authenticator(this._configuration, this._issuerMetadata.metadata);
        const customClaimsProvider = new BasicApiClaimsProvider();
        const middleware = new ClaimsMiddleware(this._claimsCache, authenticator, customClaimsProvider);

        // Try to get the access token and create empty claims
        const accessToken = this._readAccessToken(request);
        const claims = new BasicApiClaims();

        // Call the middleware to do the work
        const success = await middleware.authorizeRequestAndSetClaims(accessToken, claims);
        if (success) {

            // On success, set claims against the request context and move on to the controller logic
            return claims;

        } else {

            // Non success responses mean a missing, expired or invalid token, and we will return 401
            // Note that any failures will be thrown as exceptions and will result in a 500 response
            ResponseWriter.writeInvalidTokenResponse(response);
            return null;
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
}
