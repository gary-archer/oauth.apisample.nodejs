import {NextFunction, Request, Response} from 'express';
import {injectable} from 'inversify';
import {interfaces} from 'inversify-express-utils';
import {ClientError} from '../errors/clientError';
import {ClaimsFactory} from '../utilities/claimsFactory';
import {ResponseWriter} from '../utilities/responseWriter';
import {Authenticator} from './authenticator';
import {ClaimsCache} from './claimsCache';
import {ClaimsMiddleware} from './claimsMiddleware';
import {CoreApiClaims} from './coreApiClaims';
import {CustomPrincipal} from './customPrincipal';
import {IssuerMetadata} from './issuerMetadata';
import {OAuthConfiguration} from './oauthConfiguration';

/*
 * A singleton to act as the Express entry point for authentication processing
 */
@injectable()
export class AuthorizationFilter<TClaims extends CoreApiClaims> implements interfaces.AuthProvider {

    // Fields created during initialization
    private _configuration!: OAuthConfiguration;
    private _issuerMetadata!: IssuerMetadata;
    private _claimsCache!: ClaimsCache<TClaims>;
    private _factory!: ClaimsFactory<TClaims>;

    /*
     * Do one time initialization
     */
    public async initialize(
        configuration: OAuthConfiguration,
        factory: ClaimsFactory<TClaims>): Promise<AuthorizationFilter<TClaims>> {

        // Store input
        this._configuration = configuration;
        this._factory = factory;

        // Load metadata
        this._issuerMetadata = new IssuerMetadata(this._configuration);
        await this._issuerMetadata.load();

        // Create the claims cache
        this._claimsCache = this._factory.createClaimsCache();
        return this;
    }

    /*
     * The entry point for implementing authorization
     */
    public async getUser(
        request: Request,
        response: Response,
        next: NextFunction): Promise<interfaces.Principal> {

        // Check we have an API request
        if (request.originalUrl.startsWith('/api/') && request.method !== 'OPTIONS') {

            try {
                // If so then authorize it
                const claims = await this._authorizeApiRequest(request, response);
                if (claims) {

                    // On success, set claims against the request context and move on to the controller logic
                    return new CustomPrincipal(claims);

                } else {

                    // If we could not get claims then return a 401 error
                    // We throw here in order to avoid an unhandled promise exception
                    throw new ClientError(401, 'unauthorized', 'Missing, invalid or expired access token');
                }
            } catch (e) {

                // If there was an exception, pass it to the next middleware
                // The assumption is that the API has a final middleware that deals with errors
                next(e);
            }
        }

        return {} as any;
    }

    /*
     * Do the authorization work and return claims on success
     */
    private async _authorizeApiRequest(request: Request, response: Response): Promise<TClaims | null> {

        // Create authorization related classes on every API request
        const authenticator = new Authenticator(this._configuration, this._issuerMetadata.metadata);
        const middleware = new ClaimsMiddleware(this._claimsCache, authenticator, this._factory);

        // Try to get the access token and create empty claims
        const accessToken = this._readAccessToken(request);

        // Call the middleware to process the access token and return claims
        const claims = await middleware.authorizeRequestAndGetClaims(accessToken);
        if (!claims) {

            // Non success responses mean a missing, expired or invalid token, and we will return 401
            return null;
        } else {

            // On success, set claims against the request context and move on to the controller logic
            return claims;
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
