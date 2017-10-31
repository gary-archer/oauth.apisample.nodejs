import ErrorHandler from './errorHandler';
import * as RequestPromise from 'request-promise-native';

/*
 * Metadata is read once only
 */
let metadata = null;

/*
 * A class to handle getting claims for our API
 */
export default class ClaimsHandler {

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
     * When we receive a new token, look up the data
     */
    public lookupClaims(): any {
        
        return this._getMetadata()
            .then(this._readTokenData);
    }

    /*
     * Make a call to the metadata endpoint for the first API request
     */
    private _getMetadata(): any {
        
        if (metadata !== null) {
            return Promise.resolve(metadata);
        } 
        
        let metadataEndpoint = this._oauthConfig.authority + '/.well-known/openid-configuration';
        let options = {
            uri: metadataEndpoint,
            method: 'GET',
            json: true
        };
        
        return new RequestPromise(options)
            .then(data => {
                metadata = data;
            })
            .catch(e => {
                return Promise.reject(ErrorHandler.fromMetadataError(e, metadataEndpoint));
            });
    }
    
    /*
     * Make a call to the introspection endpoint to read our token
     */
    private _readTokenData(): any {
        
        // First set the client id and secret in the authorization header
        let credentials = `${this._oauthConfig.client_id}:${this._oauthConfig.client_secret}`;
        let authorization = new Buffer(credentials).toString('base64');  

        // Make a call to the introspection endpoint with the token in the body
        let options = {
            uri: metadata.introspection_endpoint,
            method: 'POST',
            json: true,
            headers: {
                'Authorization': 'Basic ' + authorization,
                'content-type': 'application/x-www-form-urlencoded',
            },
            form: {
                token: this._accessToken
            }
        };

        // Return a promise
        return new RequestPromise(options)
            .then(data => {
                
                // Return a token expired error if required
                if (!data.active) {
                    return Promise.reject(ErrorHandler.getTokenExpiredError());
                }
                
                // Otherwise return the data from the token with protocol claims removed
                let tokenData = {
                    exp: data.exp,
                    claims: {
                        userId: data.sub,
                        applicationId: data.cid,
                        scope: data.scope
                    }
                };
                return Promise.resolve(tokenData);
            })
            .catch(e => {
                return Promise.reject(ErrorHandler.fromIntrospectionError(e, metadata.introspection_endpoint));
            });
    }
    
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._readTokenData = this._readTokenData.bind(this);
    }
}