import {Request} from 'express';
import {inject, injectable} from 'inversify';
import jsonwebtoken from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import {Client, IntrospectionResponse, Issuer, UserinfoResponse} from 'openid-client';
import {CoreApiClaims} from '../claims/coreApiClaims';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {BASETYPES} from '../dependencies/baseTypes';
import {ErrorFactory} from '../errors/errorFactory';
import {ErrorUtils} from '../errors/errorUtils';
import {LogEntry} from '../logging/logEntry';
import {using} from '../utilities/using';
import {IssuerMetadata} from './issuerMetadata';
import { PerformanceBreakdown } from '../logging/performanceBreakdown';

/*
 * The default authenticator does OAuth token handling and is used by public APIs
 */
@injectable()
export class OAuthAuthenticator {

    private readonly _configuration: OAuthConfiguration;
    private readonly _issuer: Issuer<Client>;
    private readonly _logEntry: LogEntry;

    public constructor(
        @inject(BASETYPES.OAuthConfiguration) configuration: OAuthConfiguration,
        @inject(BASETYPES.IssuerMetadata) metadata: IssuerMetadata,
        @inject(BASETYPES.LogEntry) logEntry: LogEntry) {

        this._configuration = configuration;
        this._issuer = metadata.issuer;
        this._logEntry = logEntry;
        this._setupCallbacks();
    }

    /*
     * Do OAuth work to perform token validation and user info lookup
     */
    public async validateTokenAndGetClaims(
        accessToken: string,
        request: Request,
        claims: CoreApiClaims): Promise<void> {

        // Create a child log entry for authentication related work
        // This ensures that any errors and performances in this area are reported separately to business logic
        const authorizationLogEntry = this._logEntry.createChild('authorizer');

        // Aim to use introspection to validate the token and read token claims
        const introspectionUrl = (this._issuer.metadata as any).introspection_endpoint;
        if (introspectionUrl && this._configuration.clientId && this._configuration.clientSecret) {
            await this._introspectTokenAndGetTokenClaims(accessToken, claims, introspectionUrl);
        } else {
            await this._validateTokenInMemoryAndGetTokenClaims(accessToken, claims);
        }

        // It then adds user info claims
        await this._getUserInfoClaims(accessToken, claims);

        // Finish logging here, and note that on exception the logging framework disposes the child
        authorizationLogEntry.dispose();
    }

    /*
     * Validate the access token via introspection and populate claims
     */
    private async _introspectTokenAndGetTokenClaims(
        accessToken: string,
        claims: CoreApiClaims,
        introspectionUrl: string): Promise<number> {

        return using(this._logEntry.createPerformanceBreakdown('validateToken'), async () => {

            // Create the Authorization Server client
            const client = new this._issuer.Client({
                client_id: this._configuration.clientId,
                client_secret: this._configuration.clientSecret,
            });

            try {

                // Make a client request to do the introspection
                const tokenData: IntrospectionResponse = await client.introspect(accessToken);
                if (!tokenData.active) {
                    throw ErrorFactory.createClient401Error('Access token introspection response inactive');
                }

                // Read token claims
                const subject = this._getClaim((tokenData as any).sub, 'sub');
                const clientId = this._getClaim(tokenData.client_id, 'client_id');
                const scopes = this._getClaim(tokenData.scope, 'scope').split(' ');
                const expiry = parseInt(this._getClaim((tokenData as any).exp, 'exp'), 10);

                // Make sure the token is for this API
                this._verifyScopes(scopes);

                // Update the claims object
                claims.setTokenInfo(subject, clientId, scopes, expiry);

            } catch (e) {

                // Sanitize introspection errors to ensure they are reported clearly
                throw ErrorUtils.fromIntrospectionError(e, introspectionUrl);
            }
        });
    }

    /*
     * Validate the access token in memory via the token signing public key
     */
    private async _validateTokenInMemoryAndGetTokenClaims(accessToken: string, claims: CoreApiClaims) {

        const breakdown = this._logEntry.createPerformanceBreakdown('validateToken');
        return using (breakdown, async () => {

            // First decoode the token without verifying it so that we get the key identifier
            const decoded = jsonwebtoken.decode(accessToken, {complete: true}) as any;
            if (!decoded) {

                // Indicate an invalid token if we cannot decode it
                throw ErrorFactory.createClient401Error('Unable to decode received JWT');
            }

            // Download the token signing public key
            const publicKey = await this._getTokenSigningPublicKey(decoded.header.kid, breakdown);

            // Verify the token's digital signature
            const tokenData = await this._validateJsonWebToken(accessToken, publicKey, breakdown);

            // Read protocol claims and use the immutable user id as the subject claim
            const subject = this._getClaim(tokenData.sub, 'sub');
            const clientId = this._getClaim(tokenData.client_id, 'clientId');
            const scopes = this._getClaim(tokenData.scope, 'scope').split(' ');
            const expiry = parseInt(this._getClaim((tokenData as any).exp, 'exp'), 10);

            // Make sure the token is for this API
            this._verifyScopes(scopes);

            // Update token claims
            claims.setTokenInfo(subject, clientId, scopes, expiry);
        });
    }

    /*
     * Download the public key with which our access token is signed
     */
    private async _getTokenSigningPublicKey(
        tokenKeyIdentifier: string,
        breakdown: PerformanceBreakdown): Promise<string> {

        return using (breakdown.createChild('getTokenSigningPublicKey'), async () => {

            try {
                // Trigger a download of JWKS keys
                const keyStore = await this._issuer!.keystore(true);

                // Extend token data with central user info
                const keys = keyStore.all();
                const key = keys.find((k: any) => k.kid === tokenKeyIdentifier);
                if (key) {

                    // Convert to PEM format
                    return jwkToPem(key);
                }

            } catch (e) {

                // Report errors clearly
                throw ErrorUtils.fromSigningKeyDownloadError(e, this._issuer!.metadata.jwks_uri!);
            }

            // Indicate not found
            throw ErrorFactory.createClient401Error(
                `Key with identifier: ${tokenKeyIdentifier} not found in JWKS download`);
        });
    }

    /*
     * Call a third party library to do the token validation, and return token claims
     */
    private async _validateJsonWebToken(
        accessToken: string,
        tokenSigningPublicKey: string,
        breakdown: PerformanceBreakdown): Promise<any> {

        return using (breakdown.createChild('validateJsonWebToken'), async () => {

            try {

                // Verify the token's signature and issuer, and verify that it is not expired
                const options = {
                    issuer: this._issuer!.metadata.issuer,
                    algorithms: ['RS256'],
                };

                // On success return the claims JSON data
                return jsonwebtoken.verify(accessToken, tokenSigningPublicKey, options);

            } catch (e) {

                // Handle failures and capture the details
                let details = 'JWT verification failed';
                if (e.message) {
                    details += ` : ${e.message}`;
                }

                throw ErrorFactory.createClient401Error(details);
            }
        });
    }

    /*
     * Make sure the token is for this API
     */
    private _verifyScopes(scopes: string[]) {

        if (!scopes.find((s) => s === this._configuration.requiredScope)) {
            throw ErrorFactory.createClient401Error('Access token does not have a valid scope for this API');
        }
    }

    /*
     * Perform OAuth user info lookup
     */
    private async _getUserInfoClaims(accessToken: string, claims: CoreApiClaims): Promise<void> {

        return using(this._logEntry.createPerformanceBreakdown('userInfoLookup'), async () => {

            // Create the Authorization Server client and note that a client id must be provided
            const client = new this._issuer.Client({
                client_id: this._configuration.clientId || 'x',
            });

            try {
                // Get the user info
                const response: UserinfoResponse = await client.userinfo(accessToken);

                // Read user info claims
                const givenName = this._getClaim(response.given_name, 'given_name');
                const familyName = this._getClaim(response.family_name, 'family_name');
                const email = this._getClaim(response.email, 'email');

                // Update the claims object and indicate success
                claims.setUserInfo(givenName, familyName, email);

            } catch (e) {

                // Sanitize user info errors to ensure they are reported clearly
                throw ErrorUtils.fromUserInfoError(e, this._issuer.metadata.userinfo_endpoint!!);
            }
        });
    }

    /*
     * Sanity checks when receiving claims to avoid failing later with a cryptic error
     */
    private _getClaim(claim: string | undefined, name: string): string {

        if (!claim) {
            throw ErrorUtils.fromMissingClaim(name);
        }

        return claim;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.validateTokenAndGetClaims = this.validateTokenAndGetClaims.bind(this);
    }
}
