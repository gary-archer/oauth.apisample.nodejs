import {inject, injectable} from 'inversify';
import {custom, Issuer} from 'openid-client';
import {ClaimsPayload} from '../claims/claimsPayload';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {BASETYPES} from '../dependencies/baseTypes';
import {ErrorUtils} from '../errors/errorUtils';
import {LogEntry} from '../logging/logEntry';
import {HttpProxy} from '../utilities/httpProxy';
import {using} from '../utilities/using';
import {JwtValidator} from './jwtValidator';

/*
 * The entry point for calls to the Authorization Server
 */
@injectable()
export class OAuthAuthenticator {

    private readonly _configuration: OAuthConfiguration;
    private readonly _jwtValidator: JwtValidator;
    private readonly _logEntry: LogEntry;
    private readonly _httpProxy: HttpProxy;

    public constructor(
        @inject(BASETYPES.OAuthConfiguration) configuration: OAuthConfiguration,
        @inject(BASETYPES.JwtValidator) jwtValidator: JwtValidator,
        @inject(BASETYPES.LogEntry) logEntry: LogEntry,
        @inject(BASETYPES.HttpProxy) httpProxy: HttpProxy) {

        this._configuration = configuration;
        this._jwtValidator = jwtValidator;
        this._logEntry = logEntry;
        this._httpProxy = httpProxy;
    }

    /*
     * Do the work of performing token validation via the injected class
     */
    public async validateToken(accessToken: string): Promise<ClaimsPayload> {

        return using(this._logEntry.createPerformanceBreakdown('validateToken'), async () => {
            return this._jwtValidator.validateToken(accessToken);
        });
    }

    /*
     * Perform OAuth user info lookup when required
    * We supply a dummy client id to the library, since no client id should be needed for this OAuth message
     */
    public async getUserInfo(accessToken: string): Promise<ClaimsPayload> {

        return using(this._logEntry.createPerformanceBreakdown('userInfoLookup'), async () => {

            const issuer = new Issuer({
                issuer: this._configuration.issuer,
                userinfo_endpoint: this._configuration.userInfoEndpoint,
            });

            const client = new issuer.Client({
                client_id: 'dummy',
            });
            client[custom.http_options] = this._httpProxy.setOptions;

            try {

                const data = await client.userinfo(accessToken);
                return new ClaimsPayload(data);

            } catch (e) {

                throw ErrorUtils.fromUserInfoError(e, this._configuration.userInfoEndpoint);
            }
        });
    }
}
