import axios, {AxiosRequestConfig} from 'axios';
import {inject, injectable} from 'inversify';
import {createRemoteJWKSet} from 'jose/jwks/remote';
import {jwtVerify} from 'jose/jwt/verify';
import {JWTPayload} from 'jose/types';
import {ClaimsReader} from '../claims/claimsReader';
import {UserInfoClaims} from '../claims/userInfoClaims';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {BASETYPES} from '../dependencies/baseTypes';
import {ErrorFactory} from '../errors/errorFactory';
import {ErrorUtils} from '../errors/errorUtils';
import {LogEntry} from '../logging/logEntry';
import {HttpProxy} from '../utilities/httpProxy';
import {using} from '../utilities/using';

/*
 * The entry point for calls to the Authorization Server
 */
@injectable()
export class OAuthAuthenticator {

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
     * Do the work of performing token validation via the injected class
     */
    public async validateToken(accessToken: string): Promise<JWTPayload> {

        return using(this._logEntry.createPerformanceBreakdown('validateToken'), async () => {

            try {

                // Download token signing public keys from the Authorization Server, which are then cached
                const jwksOptions = {
                    agent: this._httpProxy.agent,
                };
                const remoteJwkSet = createRemoteJWKSet(new URL(this._configuration.jwksEndpoint), jwksOptions);

                // Perform the JWT validation according to best practices
                const options = {
                    algorithms: [this._configuration.algorithm],
                    issuer: this._configuration.issuer,
                    audience: this._configuration.audience,
                };
                const result = await jwtVerify(accessToken, remoteJwkSet, options);
                return result.payload;

            } catch (e: any) {

                // Generic errors are returned when the JWKS download fails
                if (e.code === 'ERR_JOSE_GENERIC') {
                    throw ErrorUtils.fromSigningKeyDownloadError(e, this._configuration.jwksEndpoint);
                }

                // Log the cause behind 401 errors
                let details = 'JWT verification failed';
                if (e.message) {
                    details += ` : ${e.message}`;
                }

                throw ErrorFactory.createClient401Error(details);
            }
        });
    }

    /*
     * Perform OAuth user info lookup when required
     */
    public async getUserInfo(accessToken: string): Promise<UserInfoClaims> {

        return using(this._logEntry.createPerformanceBreakdown('userInfoLookup'), async () => {

            try {

                const options = {
                    url: this._configuration.userInfoEndpoint,
                    method: 'POST',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'accept': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    httpsAgent: this._httpProxy.agent,
                };

                const response = await axios.request(options as AxiosRequestConfig);
                return ClaimsReader.userInfoClaims(response.data);

            } catch (e) {

                throw ErrorUtils.fromUserInfoError(e, this._configuration.userInfoEndpoint);
            }
        });
    }
}
