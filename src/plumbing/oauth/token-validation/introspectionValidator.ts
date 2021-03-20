import {custom, IntrospectionResponse, Issuer} from 'openid-client';
import {TokenClaims} from '../../claims/tokenClaims';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ErrorFactory} from '../../errors/errorFactory';
import {ErrorUtils} from '../../errors/errorUtils';
import {HttpProxy} from '../../utilities/httpProxy';
import {TokenValidator} from './tokenValidator';

/*
 * An implementation that validates access tokens by introspecting them
 */
export class IntrospectionValidator implements TokenValidator {

    private readonly _configuration: OAuthConfiguration;

    public constructor(configuration: OAuthConfiguration) {
        this._configuration = configuration;
    }

    /*
     * The entry point for validating a token via introspection and returning its claims
     */
    public async validateToken(accessToken: string): Promise<TokenClaims> {

        const issuer = new Issuer({
            issuer:this._configuration.issuer,
            introspection_endpoint: this._configuration.introspectEndpoint,
        });

        const client = new issuer.Client({
            client_id: this._configuration.introspectClientId,
            client_secret: this._configuration.introspectClientSecret,
        });

        client[custom.http_options] = HttpProxy.getOptions;

        try {

            // Make a client request to do the introspection
            const tokenData: IntrospectionResponse = await client.introspect(accessToken);
            if (!tokenData.active) {
                throw ErrorFactory.createClient401Error('Access token introspection response inactive');
            }

            // Read token claims
            const subject = this._getClaim((tokenData as any).sub, 'sub');
            const scopes = this._getClaim(tokenData.scope, 'scope').split(' ');
            const expiry = parseInt(this._getClaim((tokenData as any).exp, 'exp'), 10);

            // Return the claims object
            return new TokenClaims(subject, scopes, expiry);

        } catch (e) {

            // Sanitize introspection errors to ensure they are reported clearly
            throw ErrorUtils.fromIntrospectionError(e, this._configuration.introspectEndpoint);
        }
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
