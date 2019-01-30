import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ApiClaims} from '../../entities/apiClaims';
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
     * When we receive a new token, validate it and return token claims
     */
    public async validateTokenAndGetTokenClaims(accessToken: string): Promise<TokenValidationResult> {

        return await this._introspectTokenAndGetClaims(accessToken);
    }

    /*
     * This sample uses Okta user info as the source of central user data
     * Since getting user info is an OAuth operation we include that in this class also
     */
    public async getCentralUserInfoClaims(claims: ApiClaims, accessToken: string) {

        return await this._lookupCentralUserDataClaims(claims, accessToken);
    }

    /*
     * Make a call to the introspection endpoint to read our token
     */
    private async _introspectTokenAndGetClaims(accessToken: string): Promise<TokenValidationResult> {

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
                this._getClaim(tokenData.cid, 'client_id'),
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
    private async _lookupCentralUserDataClaims(claims: ApiClaims, accessToken: string): Promise<void> {

        // Create the Authorization Server client
        const client = new this._issuer.Client();

        try {
            // Extend token data with central user info
            const response = await client.userinfo(accessToken);
            claims.setCentralUserInfo(response.given_name, response.family_name, response.email);

        } catch (e) {

            // Report user info lookup errors clearly
            throw ErrorHandler.fromUserInfoError(e, this._issuer.userinfo_endpoint);
        }
    }

    /*
     * Sanity checks when receiving claims to avoid failing later with a cryptic error
     */
    private _getClaim(claim: string, name: string): any {

        if (!claim) {
            throw ErrorHandler.fromMissingClaim(claim);
        }

        return claim;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._introspectTokenAndGetClaims = this._introspectTokenAndGetClaims.bind(this);
        this._lookupCentralUserDataClaims = this._lookupCentralUserDataClaims.bind(this);
    }
}
