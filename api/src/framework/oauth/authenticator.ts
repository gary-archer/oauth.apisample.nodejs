import {ErrorHandler} from '../errors/errorHandler';
import {CoreApiClaims} from './coreApiClaims';
import {OAuthConfiguration} from './oauthConfiguration';

/*
 * The entry point for OAuth related operations
 */
export class Authenticator {

    /*
     * Instance fields
     */
    private _oauthConfig: OAuthConfiguration;
    private _issuer: any;

    /*
     * Receive configuration and request metadata
     */
    public constructor(oauthConfig: OAuthConfiguration, issuer: any) {

        this._oauthConfig = oauthConfig;
        this._issuer = issuer;
        this._setupCallbacks();
    }

    /*
     * Make a call to the introspection endpoint to read our token
     */
    public async validateTokenAndSetClaims(accessToken: string, claims: CoreApiClaims): Promise<[boolean, number]> {

        // Create the Authorization Server client
        const client = new this._issuer.Client({
            client_id: this._oauthConfig.clientId,
            client_secret: this._oauthConfig.clientSecret,
        });

        try {

            // Make a client request to do the introspection
            const tokenData = await client.introspect(accessToken);

            // Return an invalid result if the token is invalid or expired
            if (!tokenData.active) {
                return [false, 0];
            }

            // Read protocol claims and we will use the immutable user id as the subject claim
            const userId = this._getClaim(tokenData.uid, 'uid');
            const clientId = this._getClaim(tokenData.client_id, 'client_id');
            const scope = this._getClaim(tokenData.scope, 'scope');
            const expiry = this._getClaim(tokenData.exp, 'exp');

            // Update the claims object and also include the expiry
            claims.setTokenInfo(userId, clientId, scope.split(' '));
            return [true, expiry];

        } catch (e) {

            // Report introspection errors clearly
            throw ErrorHandler.fromIntrospectionError(e, this._issuer.introspection_endpoint);
        }
    }

    /*
     * We will read central user data by calling the Open Id Connect User Info endpoint
     * For many companies it may instead make sense to call a Central User Info API
     */
    public async setCentralUserInfoClaims(accessToken: string, claims: CoreApiClaims): Promise<boolean> {

        // Create the Authorization Server client
        const client = new this._issuer.Client();

        try {
            // Get the user info
            const response = await client.userinfo(accessToken);

            // Read user info claims
            const givenName = this._getClaim(response.given_name, 'given_name');
            const familyName = this._getClaim(response.family_name, 'family_name');
            const email = this._getClaim(response.email, 'email');

            // Update the claims object and indicate success
            claims.setCentralUserInfo(givenName, familyName, email);
            return true;

        } catch (e) {

            // Handle a race condition where the access token expires just after introspection
            // In this case we return false to indicate expiry
            if (e.error && e.error === 'invalid_token') {
                return false;
            }

            // Otherwise log and throw user info
            throw ErrorHandler.fromUserInfoError(e, this._issuer.userinfo_endpoint);
        }
    }

    /*
     * Sanity checks when receiving claims to avoid failing later with a cryptic error
     */
    private _getClaim(claim: string, name: string): any {

        if (!claim) {
            throw ErrorHandler.fromMissingClaim(name);
        }

        return claim;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.validateTokenAndSetClaims = this.validateTokenAndSetClaims.bind(this);
        this.setCentralUserInfoClaims = this.setCentralUserInfoClaims.bind(this);
    }
}
