import {Request} from 'express';
import {inject, injectable} from 'inversify';
import {Client, IntrospectionResponse, Issuer, UserinfoResponse} from 'openid-client';
import {CoreApiClaims, ErrorFactory} from '../../../framework-api-base';
import {BASEFRAMEWORKTYPES, LogEntry} from '../../../framework-base';
import {using} from '../../../framework-base';
import {INTERNALTYPES} from '../configuration/internalTypes';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {OAuthErrorUtils} from '../errors/oauthErrorUtils';
import {IssuerMetadata} from './issuerMetadata';

/*
 * The default authenticator does OAuth token handling and is used by public APIs
 */
@injectable()
export class OAuthAuthenticator {

    private readonly _configuration: OAuthConfiguration;
    private readonly _issuer: Issuer<Client>;
    private readonly _logEntry: LogEntry;

    public constructor(
        @inject(INTERNALTYPES.Configuration) configuration: OAuthConfiguration,
        @inject(INTERNALTYPES.IssuerMetadata) metadata: IssuerMetadata,
        @inject(BASEFRAMEWORKTYPES.LogEntry) logEntry: LogEntry) {

        this._configuration = configuration;
        this._issuer = metadata.issuer;
        this._logEntry = logEntry;
        this._setupCallbacks();
    }

    /*
     * Our form of authentication performs introspection and user info lookup
     */
    public async authenticateAndSetClaims(
        accessToken: string,
        request: Request,
        claims: CoreApiClaims): Promise<number> {

        // Create a child log entry for authentication related work
        // This ensures that any errors and performances in this area are reported separately to business logic
        const authorizationLogEntry = this._logEntry.createChild('authorizer');

        // Our implementation introspects the token to get token claims
        const expiry = await this._introspectTokenAndSetTokenClaims(accessToken, claims);

        // It then adds user info claims
        await this._setCentralUserInfoClaims(accessToken, claims);

        // Finish logging here, and note that on exception the logging framework disposes the child
        authorizationLogEntry.dispose();

        // It then returns the token expiry as a cache time to live
        return expiry;
    }

    /*
     * Introspection processing
     */
    private async _introspectTokenAndSetTokenClaims(accessToken: string, claims: CoreApiClaims): Promise<number> {

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
                    throw ErrorFactory.create401Error('Access token is expired and failed introspection');
                }

                // Read protocol claims and we will use the immutable user id as the subject claim
                const userId = this._getClaim((tokenData as any).uid, 'uid');
                const clientId = this._getClaim(tokenData.client_id, 'client_id');
                const scope = this._getClaim(tokenData.scope, 'scope');

                // Update the claims object
                claims.setTokenInfo(userId, clientId, scope.split(' '));

                // Return the expiry as a number
                const expiry = this._getClaim((tokenData as any).exp, 'exp');
                return parseInt(expiry, 10);

            } catch (e) {

                // Sanitize introspection errors to ensure they are reported clearly
                throw OAuthErrorUtils.fromIntrospectionError(e, (this._issuer as any).introspection_endpoint);
            }
        });
    }

    /*
     * User info lookup
     */
    private async _setCentralUserInfoClaims(accessToken: string, claims: CoreApiClaims): Promise<void> {

        return using(this._logEntry.createPerformanceBreakdown('userInfoLookup'), async () => {

            // Create the Authorization Server client
            const client = new this._issuer.Client({
                client_id: this._configuration.clientId,
            });

            try {
                // Get the user info
                const response: UserinfoResponse = await client.userinfo(accessToken);

                // Read user info claims
                const givenName = this._getClaim(response.given_name, 'given_name');
                const familyName = this._getClaim(response.family_name, 'family_name');
                const email = this._getClaim(response.email, 'email');

                // Update the claims object and indicate success
                claims.setCentralUserInfo(givenName, familyName, email);

            } catch (e) {

                // Sanitize user info errors to ensure they are reported clearly
                throw OAuthErrorUtils.fromUserInfoError(e, this._issuer.metadata.userinfo_endpoint!!);
            }
        });
    }

    /*
     * Sanity checks when receiving claims to avoid failing later with a cryptic error
     */
    private _getClaim(claim: string | undefined, name: string): string {

        if (!claim) {
            throw OAuthErrorUtils.fromMissingClaim(name);
        }

        return claim;
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this.authenticateAndSetClaims = this.authenticateAndSetClaims.bind(this);
    }
}
