import {Request} from 'express';
import {FRAMEWORKTYPES} from '../configuration/frameworkTypes';
import {ClientError} from '../errors/clientError';
import {ChildContainerHelper} from '../utilities/childContainerHelper';
import {BaseAuthorizer} from './baseAuthorizer';
import {ClaimsCache} from './claimsCache';
import {ClaimsSupplier} from './claimsSupplier';
import {CoreApiClaims} from './coreApiClaims';
import {OAuthAuthenticator} from './oauthAuthenticator';

/*
 * The Express entry point for OAuth token validation and claims lookup
 */
export class OAuthAuthorizer<TClaims extends CoreApiClaims> extends BaseAuthorizer {

    /*
     * Receive dependencies
     */
    public constructor(unsecuredPaths: string[]) {
        super(unsecuredPaths);
    }

    /*
     * Do the OAuth processing via the middleware class
     */
    protected async execute(request: Request): Promise<CoreApiClaims> {

        // First read the access token
        const accessToken = this._readAccessToken(request);
        if (!accessToken) {
            throw ClientError.create401('No access token was supplied in the bearer header');
        }

        // Get the child container for this HTTP request
        const container = ChildContainerHelper.resolve(request);

        // Bypass and use cached results if they exist
        const cache = container.get<ClaimsCache<TClaims>>(FRAMEWORKTYPES.ClaimsCache);
        const cachedClaims = await cache.getClaimsForToken(accessToken);
        if (cachedClaims) {

            // Rebind claims to this requests's child container so that they are injectable into business logic
            container.bind<TClaims>(FRAMEWORKTYPES.ApiClaims).toConstantValue(cachedClaims);
            return cachedClaims;
        }

        // Resolve dependencies needed for authorization
        const claimsSupplier = container.get<ClaimsSupplier<TClaims>>(FRAMEWORKTYPES.ClaimsSupplier);
        const authenticator = container.get<OAuthAuthenticator>(FRAMEWORKTYPES.OAuthAuthenticator);

        // Create new claims which we will then populate
        const claims = claimsSupplier.createEmptyClaims();

        // Do the authentication work to get claims, which in our case means OAuth processing
        const expiry = await authenticator.authenticateAndSetClaims(accessToken, request, claims);

        // Add any custom product specific custom claims if required
        await claimsSupplier.createCustomClaimsProvider().addCustomClaims(accessToken, request, claims);

        // Cache the claims against the token hash until the token's expiry time
        // The next time the API is called, all of the above results can be quickly looked up
        await cache.addClaimsForToken(accessToken, expiry, claims);

        // Rebind claims to this requests's child container so that they are injectable into business logic
        container.bind<TClaims>(FRAMEWORKTYPES.ApiClaims).toConstantValue(claims);
        return claims;
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
