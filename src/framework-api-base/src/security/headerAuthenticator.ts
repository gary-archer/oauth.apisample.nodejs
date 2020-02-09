import {Request} from 'express';
import {injectable} from 'inversify';
import {ErrorUtils} from '../errors/errorUtils';
import {CoreApiClaims} from '../security/coreApiClaims';

/*
 * An alternative authenticator for private APIs that reads headers supplied by a public API
 */
@injectable()
export class HeaderAuthenticator  {

    /*
     * This form of authentication just reads claims from custom headers
     */
    public async authorizeRequestAndGetClaims(request: Request): Promise<CoreApiClaims> {

        const claims = new CoreApiClaims();

        // Get token claims
        const userId = this._getHeaderClaim(request, 'x-mycompany-user-id');
        const clientId = this._getHeaderClaim(request, 'x-mycompany-client-id');
        const scope = this._getHeaderClaim(request, 'x-mycompany-scope');

        // Get user info claims
        const givenName = this._getHeaderClaim(request, 'x-mycompany-given-name');
        const familyName = this._getHeaderClaim(request, 'x-mycompany-family-name');
        const email = this._getHeaderClaim(request, 'x-mycompany-email');

        // Update the claims object
        claims.setTokenInfo(userId, clientId, scope.split(' '));
        claims.setCentralUserInfo(givenName, familyName, email);
        return claims;
    }

    /*
     * Try to read a claim from custom request headers
     */
    private _getHeaderClaim(request: Request, claimName: string): string {

        const result = request.header(claimName);
        if (!result) {
            throw ErrorUtils.fromMissingClaim(claimName);
        }

        return result;
    }
}
