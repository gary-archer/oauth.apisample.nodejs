import * as OpenIdClient from 'openid-client';
import * as TunnelAgent from 'tunnel-agent';
import * as Url from 'url';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';

/*
 * A singleton to read metadata at application startup
 */
export class IssuerMetadata {

    /*
     * Instance fields
     */
    private _oauthConfig: OAuthConfiguration;
    private _metadata: any;

    /*
     * Receive configuration
     */
    public constructor(oauthConfig: OAuthConfiguration) {
        this._oauthConfig = oauthConfig;

        // Set up HTTP debugging of OAuth requests
        if (process.env.HTTPS_PROXY) {
            const opts = Url.parse(process.env.HTTPS_PROXY as string);
            OpenIdClient.Issuer.defaultHttpOptions = {
                agent: TunnelAgent.httpsOverHttp({
                    proxy: opts,
                }),
            };
        }
    }

    /*
     * Load the metadata at startup
     */
    public async load(): Promise<void> {
        this._metadata = await OpenIdClient.Issuer.discover(this._oauthConfig.authority);
    }

    public get metadata(): string {
        return this._metadata;
    }
}
