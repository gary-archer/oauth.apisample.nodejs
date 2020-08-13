import {Request} from 'express';
import {inject, injectable} from 'inversify';
import {Client, IntrospectionResponse, Issuer, UserinfoResponse} from 'openid-client';
import {CoreApiClaims} from '../claims/coreApiClaims';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {BASETYPES} from '../dependencies/baseTypes';
import {ErrorFactory} from '../errors/errorFactory';
import {ErrorUtils} from '../errors/errorUtils';
import {LogEntry} from '../logging/logEntry';
import {using} from '../utilities/using';
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
        @inject(BASETYPES.OAuthConfiguration) configuration: OAuthConfiguration,
        @inject(BASETYPES.IssuerMetadata) metadata: IssuerMetadata,
        @inject(BASETYPES.LogEntry) logEntry: LogEntry) {

        this._configuration = configuration;
        this._issuer = metadata.issuer;
        this._logEntry = logEntry;
        this._setupCallbacks();
    }

    /*
     * Introspect the token to validate it and read its claims
     */
    public async validateTokenAndGetClaims(
        accessToken: string,
        request: Request,
        claims: CoreApiClaims): Promise<void> {

        // Create a child log entry for authentication related work
        // This ensures that any errors and performances in this area are reported separately to business logic
        const authorizationLogEntry = this._logEntry.createChild('authorizer');

        // Our implementation introspects the token to get token claims
        await this._introspectTokenAndGetTokenClaims(accessToken, claims);

        // It then adds user info claims
        await this._getCentralUserInfoClaims(accessToken, claims);

        // Finish logging here, and note that on exception the logging framework disposes the child
        authorizationLogEntry.dispose();
    }

    /*
     * Introspection processing
     */
    private async _introspectTokenAndGetTokenClaims(accessToken: string, claims: CoreApiClaims): Promise<number> {

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
                    throw ErrorFactory.createClient401Error('Access token is expired and failed introspection');
                }

                // Read token claims and use the immutable user id as the subject claim
                const subject = this._getClaim((tokenData as any).uid, 'uid');
                const clientId = this._getClaim(tokenData.client_id, 'client_id');
                const scope = this._getClaim(tokenData.scope, 'scope');
                const expiry = parseInt(this._getClaim((tokenData as any).exp, 'exp'), 10);

                // Update the claims object
                claims.setTokenInfo(subject, clientId, scope.split(' '), expiry);

            } catch (e) {

                // Sanitize introspection errors to ensure they are reported clearly
                throw ErrorUtils.fromIntrospectionError(e, (this._issuer as any).introspection_endpoint);
            }
        });
    }

    /*
     * User info lookup
     */
    private async _getCentralUserInfoClaims(accessToken: string, claims: CoreApiClaims): Promise<void> {

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
