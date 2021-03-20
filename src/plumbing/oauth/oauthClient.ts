import {inject, injectable} from 'inversify';
import {custom, Issuer} from 'openid-client';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {BASETYPES} from '../dependencies/baseTypes';
import {ErrorUtils} from '../errors/errorUtils';
import {LogEntry} from '../logging/logEntry';
import {HttpProxy} from '../utilities/httpProxy';
import {using} from '../utilities/using';
import {TokenValidator} from './token-validation/tokenValidator';

/*
 * An entry point class for initiating calls to the Authorization Server
 */
@injectable()
export class OAuthClient {

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
    public async validateToken(accessToken: string): Promise<any> {

        return using(this._logEntry.createPerformanceBreakdown('validateToken'), async () => {
            return await this._tokenValidator.validateToken(accessToken);
        });
    }

    /*
     * Perform OAuth user info lookup when required
    * We supply a dummy client id to the library, since no client id should be needed for this OAuth message
     */
    public async getUserInfo(accessToken: string): Promise<any> {

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
                return await client.userinfo(accessToken);

            } catch (e) {

                // Sanitize user info errors to ensure they are reported clearly
                throw ErrorUtils.fromUserInfoError(e, this._configuration.userInfoEndpoint);
            }
        });
    }
}
