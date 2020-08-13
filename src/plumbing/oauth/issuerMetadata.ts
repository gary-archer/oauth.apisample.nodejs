import {Client, custom, Issuer} from 'openid-client';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {ErrorUtils} from '../errors/errorUtils';
import {HttpProxy} from '../utilities/httpProxy';

/*
 * A singleton to read metadata at application startup
 */
export class IssuerMetadata {

    private readonly _configuration: OAuthConfiguration;
    private _issuer: Issuer<Client> | null;

    public constructor(configuration: OAuthConfiguration) {
        this._configuration = configuration;
        this._issuer = null;

        // Set up OAuth HTTP requests and extend the default 1.5 second timeout
        custom.setHttpOptionsDefaults({
            timeout: 10000,
            agent: HttpProxy.get(),
        });
    }

    /*
     * Load the metadata at startup, and the process ends if this fails
     */
    public async load(): Promise<void> {

        try {
            const endpoint = `${this._configuration.authority}/.well-known/openid-configuration`;
            this._issuer = await Issuer.discover(endpoint);
        } catch (e) {
            throw ErrorUtils.fromMetadataError(e, this._configuration.authority);
        }
    }

    /*
     * Return the metadata for use during API requests
     */
    public get issuer(): Issuer<Client> {
        return this._issuer!!;
    }
}
