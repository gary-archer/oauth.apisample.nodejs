import * as OpenIdClient from 'openid-client';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ErrorHandler} from '../errors/errorHandler';
import {DebugProxyAgent} from '../utilities/debugProxyAgent';

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
        OpenIdClient.Issuer.defaultHttpOptions = {
            agent: DebugProxyAgent.get(),
        };
    }

    /*
     * Load the metadata at startup
     */
    public async load(): Promise<void> {

        try {
            this._metadata = await OpenIdClient.Issuer.discover(this._oauthConfig.authority);
        } catch (e) {
            throw ErrorHandler.fromMetadataError(e, this._oauthConfig.authority);
        }
    }

    /*
     * Return the metadata for use during API requests
     */
    public get metadata(): string {
        return this._metadata;
    }
}
