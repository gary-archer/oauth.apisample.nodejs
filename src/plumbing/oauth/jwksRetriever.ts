import {inject, injectable} from 'inversify';
import {createRemoteJWKSet, JWSHeaderParameters, FlattenedJWSInput} from 'jose';
import {GetKeyFunction} from 'jose/dist/types/types';
import {OAuthConfiguration} from '../configuration/oauthConfiguration';
import {BASETYPES} from '../dependencies/baseTypes';
import {HttpProxy} from '../utilities/httpProxy';

/*
 * A singleton that caches the result of createRemoteJWKSet, to ensure efficient lookup
 */
@injectable()
export class JwksRetriever {

    private readonly _remoteJWKSet: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>;

    public constructor(
        @inject(BASETYPES.OAuthConfiguration) configuration: OAuthConfiguration,
        @inject(BASETYPES.HttpProxy) httpProxy: HttpProxy) {

        const jwksOptions = {
            agent: httpProxy.agent,
        };
        this._remoteJWKSet = createRemoteJWKSet(new URL(configuration.jwksEndpoint), jwksOptions);
    }

    public get remoteJWKSet(): GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput> {
        return this._remoteJWKSet;
    }
}
