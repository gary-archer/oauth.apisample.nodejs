import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ApiClaims} from '../../entities/apiClaims';
import {UserInfoClaims} from '../../entities/userInfoClaims';
import {ErrorHandler} from '../errors/errorHandler';
import {TokenValidationResult} from './tokenValidationResult';

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
    public async validateTokenAndGetTokenClaims(accessToken: string): Promise<TokenValidationResult> {

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
                return {
                    isValid: false,
                } as TokenValidationResult;
            }

            // Get token claims and use the immutable user id as the subject claim
            const claims = new ApiClaims(
                this._getClaim(tokenData.uid, 'uid'),
                this._getClaim(tokenData.client_id, 'client_id'),
                this._getClaim(tokenData.scope, 'scope'),
            );

            return {
                isValid: true,
                expiry: this._getClaim(tokenData.exp, 'exp'),
                claims,
            } as TokenValidationResult;

        } catch (e) {

            // Report introspection errors clearly
            throw ErrorHandler.fromIntrospectionError(e, this._issuer.introspection_endpoint);
        }
    }

    /*
     * We will read central user data by calling the Open Id Connect User Info endpoint
     * For many companies it may instead make sense to call a Central User Info API
     */
    public async getCentralUserInfoClaims(accessToken: string): Promise<UserInfoClaims | null> {

        // Create the Authorization Server client
        const client = new this._issuer.Client();

        try {
            // Get the user info
            const response = await client.userinfo(accessToken);

            // Check claims exist, then return them in an object
            return {
                givenName: this._getClaim(response.given_name, 'given_name'),
                familyName: this._getClaim(response.family_name, 'family_name'),
                email: this._getClaim(response.email, 'email'),
            } as UserInfoClaims;

        } catch (e) {

            // Handle a race condition where the access token expires just after introspection
            // In this case we return null to indicate expiry
            if (e.error && e.error === 'invalid_token') {
                return null;
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
        this.validateTokenAndGetTokenClaims = this.validateTokenAndGetTokenClaims.bind(this);
        this.getCentralUserInfoClaims = this.getCentralUserInfoClaims.bind(this);
    }
}
