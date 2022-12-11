import axios, {AxiosRequestConfig} from 'axios';
import {inject, injectable} from 'inversify';
import {ClaimsReader} from '../../claims/claimsReader';
import {UserInfoClaims} from '../../claims/userInfoClaims';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {BASETYPES} from '../../dependencies/baseTypes';
import {ErrorUtils} from '../../errors/errorUtils';
import {LogEntry} from '../../logging/logEntry';
import {HttpProxy} from '../../utilities/httpProxy';
import {using} from '../../utilities/using';

/*
 * The entry point for calls to the Authorization Server
 */
@injectable()
export class UserInfoClient {

    private readonly _configuration: OAuthConfiguration;
    private readonly _logEntry: LogEntry;
    private readonly _httpProxy: HttpProxy;

    public constructor(
        @inject(BASETYPES.OAuthConfiguration) configuration: OAuthConfiguration,
        @inject(BASETYPES.LogEntry) logEntry: LogEntry,
        @inject(BASETYPES.HttpProxy) httpProxy: HttpProxy) {

        this._configuration = configuration;
        this._logEntry = logEntry;
        this._httpProxy = httpProxy;
    }

    /*
     * Perform OAuth user info lookup when required
     */
    public async getUserInfo(accessToken: string): Promise<UserInfoClaims> {

        return using(this._logEntry.createPerformanceBreakdown('userInfoLookup'), async () => {

            try {

                const options = {
                    url: this._configuration.claimsCache!.userInfoEndpoint,
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    httpsAgent: this._httpProxy.agent,
                };

                const response = await axios.request(options as AxiosRequestConfig);
                return ClaimsReader.userInfoClaims(response.data);

            } catch (e: any) {

                throw ErrorUtils.fromUserInfoError(e, this._configuration.claimsCache!.userInfoEndpoint);
            }
        });
    }
}
