import {inject, injectable} from 'inversify';
import {createRemoteJWKSet, JWTVerifyGetKey, RemoteJWKSetOptions} from 'jose';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {BASETYPES} from '../dependencies/baseTypes';
import {HttpProxy} from '../utilities/httpProxy';

/*
 * A singleton that caches the result of createRemoteJWKSet, to ensure efficient lookup
 */
@injectable()
export class JwksRetriever {

    private readonly _remoteJWKSet: JWTVerifyGetKey;

    public constructor(
        @inject(BASETYPES.OAuthConfiguration) configuration: OAuthConfiguration,
        @inject(BASETYPES.HttpProxy) httpProxy: HttpProxy) {

        // View requests via an HTTP proxy if required
        const jwksOptions = {
            agent: httpProxy.agent,
        } as RemoteJWKSetOptions;

        // Integration tests use a value of zero to ensure multiple test runs without unfound JWK errors
        if (configuration.jwksCooldownDuration !== undefined) {
            jwksOptions.cooldownDuration = configuration.jwksCooldownDuration;
        }

        // Create this object only once
        this._remoteJWKSet = createRemoteJWKSet(new URL(configuration.jwksEndpoint), jwksOptions);
    }

    public get remoteJWKSet(): JWTVerifyGetKey {
        return this._remoteJWKSet;
    }
}
