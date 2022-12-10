import {inject, injectable} from 'inversify';
import {JWTPayload, jwtVerify} from 'jose';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {BASETYPES} from '../dependencies/baseTypes';
import {ErrorFactory} from '../errors/errorFactory';
import {ErrorUtils} from '../errors/errorUtils';
import {LogEntry} from '../logging/logEntry';
import {using} from '../utilities/using';
import {JwksRetriever} from './jwksRetriever';

/*
 * The entry point for calls to the Authorization Server
 */
@injectable()
export class OAuthAuthenticator {

    private readonly _configuration: OAuthConfiguration;
    private readonly _logEntry: LogEntry;
    private readonly _jwksRetriever: JwksRetriever;

    public constructor(
        @inject(BASETYPES.OAuthConfiguration) configuration: OAuthConfiguration,
        @inject(BASETYPES.LogEntry) logEntry: LogEntry,
        @inject(BASETYPES.JwksRetriever) jwksRetriever: JwksRetriever) {

        this._configuration = configuration;
        this._logEntry = logEntry;
        this._jwksRetriever = jwksRetriever;
    }

    /*
     * Do the work of performing token validation via the injected class
     */
    public async validateToken(accessToken: string): Promise<JWTPayload> {

        return using(this._logEntry.createPerformanceBreakdown('validateToken'), async () => {

            try {

                // Perform the JWT validation according to best practices
                const options = {
                    algorithms: ['RS256'],
                    issuer: this._configuration.issuer,
                    audience: this._configuration.audience,
                };
                const result = await jwtVerify(accessToken, this._jwksRetriever.remoteJWKSet, options);

                return result.payload;

            } catch (e: any) {

                // Generic errors are returned when the JWKS download fails
                if (e.code === 'ERR_JOSE_GENERIC') {
                    throw ErrorUtils.fromSigningKeyDownloadError(e, this._configuration.jwksEndpoint);
                }

                // Otherwise return a 401 error, such as when a JWT with an invalid 'kid' value is supplied
                let details = 'JWT verification failed';
                if (e.message) {
                    details += ` : ${e.message}`;
                }

                throw ErrorFactory.createClient401Error(details);
            }
        });
    }
}
