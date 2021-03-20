import {inject, injectable} from 'inversify';
import {custom, Issuer, UserinfoResponse} from 'openid-client';
import {TokenClaims} from '../claims/tokenClaims';
import {UserInfoClaims} from '../claims/userInfoClaims';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {BASETYPES} from '../dependencies/baseTypes';
import {ErrorUtils} from '../errors/errorUtils';
import {LogEntry} from '../logging/logEntry';
import {HttpProxy} from '../utilities/httpProxy';
import {using} from '../utilities/using';
import {TokenValidator} from './token-validation/tokenValidator';

/*
 * A class responsible for initiating calls to the Authorization Server
 */
@injectable()
export class OAuthAuthenticator {

    private readonly _configuration: OAuthConfiguration;
    private readonly _tokenValidator: TokenValidator;
    private readonly _logEntry: LogEntry;

    public constructor(
        @inject(BASETYPES.OAuthConfiguration) configuration: OAuthConfiguration,
        @inject(BASETYPES.TokenValidator) tokenValidator: TokenValidator,
        @inject(BASETYPES.LogEntry) logEntry: LogEntry) {

        this._configuration = configuration;
        this._tokenValidator = tokenValidator;
        this._logEntry = logEntry;
    }

    /*
     * Do the work of performing token validation via the injected class
     */
    public async validateToken(accessToken: string): Promise<TokenClaims> {

        return using(this._logEntry.createPerformanceBreakdown('validateToken'), async () => {
            return await this._tokenValidator.validateToken(accessToken);
        });
    }

    /*
     * Perform OAuth user info lookup when required
    * We supply a dummy client id to the library, since no client id should be needed for this OAuth message
     */
    public async getUserInfo(accessToken: string): Promise<UserInfoClaims> {

        return using(this._logEntry.createPerformanceBreakdown('userInfoLookup'), async () => {

            const issuer = new Issuer({
                issuer: this._configuration.issuer,
                userinfo_endpoint: this._configuration.userInfoEndpoint,
            });

            const client = new issuer.Client({
                client_id: 'dummy',
            });
            client[custom.http_options] = HttpProxy.getOptions;

            try {
                // Get the user info
                const response: UserinfoResponse = await client.userinfo(accessToken);

                // Read user info claims
                const givenName = this._getClaim(response.given_name, 'given_name');
                const familyName = this._getClaim(response.family_name, 'family_name');
                const email = this._getClaim(response.email, 'email');

                // Return the claims object
                return new UserInfoClaims(givenName, familyName, email);

            } catch (e) {

                // Sanitize user info errors to ensure they are reported clearly
                throw ErrorUtils.fromUserInfoError(e, this._configuration.userInfoEndpoint);
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
}
