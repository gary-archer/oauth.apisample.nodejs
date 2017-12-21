import * as OpenIdClient from 'openid-client';
import * as TunnelAgent from 'tunnel-agent';
import * as Url from 'url';
import ErrorHandler from './errorHandler';
import ApiLogger from './apiLogger';

/*
 * This handles debugging to Fiddler or Charles so that we can view requests to Okta
 * I am currently having to use the 1.17.0 openid-client due to a got library issue described here
 * https://github.com/sindresorhus/got/issues/427
 */
if (process.env.HTTPS_PROXY) {
    
    let opts = Url.parse(<any>process.env.HTTPS_PROXY);
    OpenIdClient.Issuer.defaultHttpOptions = {
        agent: TunnelAgent.httpsOverHttp({
            proxy: opts
        })
    };
}

/*
 * Metadata is read once only
 */
let issuer:any = null;

/*
 * A class to handle getting claims for our API
 */
export default class Authenticator {

    /*
     * Fields
     */
    private _oauthConfig: any;
    private _accessToken: string;
    
    /*
     * Receive configuration and request metadata
     */
    public constructor(oauthConfig: any, accessToken: string) {
        
        this._oauthConfig = oauthConfig;
        this._accessToken = accessToken;
        this._setupCallbacks();
    }
    
    /*
     * When we receive a new token, introspect it to validate and get claims
     */
    public async validateTokenAndLookupClaims(): Promise<any> {
        
        await this._getMetadata();
        return await this._readTokenData();
    }

    /*
     * Make a call to the metadata endpoint for the first API request
     */
    private async _getMetadata(): Promise<void> {
        
        if (issuer !== null) {
            return Promise.resolve();
        } 
        
        try {
            issuer = await OpenIdClient.Issuer.discover(this._oauthConfig.authority);
        }
        catch(e) {
            throw ErrorHandler.fromMetadataError(e, this._oauthConfig.authority);
        }
    }
    
    /*
     * Make a call to the introspection endpoint to read our token
     */
    private async _readTokenData(): Promise<any> {
        
        // Create the Authorization Server client
        let client = new issuer.Client({
            client_id: this._oauthConfig.client_id,
            client_secret: this._oauthConfig.client_secret
        });

        try {

            // Use it to do the introspection
            let data = await client.introspect(this._accessToken);
            if (!data.active) {
    
                // Return a 401 if the token is no longer active
                return Promise.reject(ErrorHandler.getTokenExpiredError());
            }
                
            // Otherwise return the data from the token with protocol claims removed
            return {
                exp: data.exp,
                claims: {
                    userId: data.sub,
                    clientId: data.cid,
                    scope: data.scope
                }
            };
        }
        catch(e) {

            // Report introspection errors clearly
            throw ErrorHandler.fromIntrospectionError(e, issuer.introspection_endpoint);
        }
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._readTokenData = this._readTokenData.bind(this);
    }
}