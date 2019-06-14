import {Request} from 'express';
import {inject, injectable} from 'inversify';
import {FrameworkConfiguration} from '../configuration/frameworkConfiguration';
import {FRAMEWORKTYPES} from '../configuration/frameworkTypes';
import {OAuthErrorHandler} from '../errors/oauthErrorHandler';
import {CoreApiClaims} from './coreApiClaims';

/*
 * An alternative authenticator for private APIs that reads headers supplied by a public API
 */
@injectable()
export class HeaderAuthenticator  {

    // Injected dependencies
    private readonly _configuration: FrameworkConfiguration;

    /*
     * Receive dependencies
     */
    public constructor(
        @inject(FRAMEWORKTYPES.Configuration) configuration: FrameworkConfiguration) {
        this._configuration = configuration;
    }

    /*
     * This form of authentication just reads claims from custom headers
     */
    public async authorizeRequestAndGetClaims(request: Request): Promise<CoreApiClaims> {

        const claims = new CoreApiClaims();

        // Get token claims
        const userId = this._getHeaderClaim(request, 'x-sample-user-id');
        const clientId = this._getHeaderClaim(request, 'x-sample-client-id');
        const scope = this._getHeaderClaim(request, 'x-sample-scope');

        // Get user info claims
        const givenName = this._getHeaderClaim(request, 'x-sample-given-name');
        const familyName = this._getHeaderClaim(request, 'x-sample-family-name');
        const email = this._getHeaderClaim(request, 'x-sample-email');

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

            const handler = new OAuthErrorHandler(this._configuration);
            throw handler.fromMissingClaim(claimName);
        }

        return result;
    }
}
