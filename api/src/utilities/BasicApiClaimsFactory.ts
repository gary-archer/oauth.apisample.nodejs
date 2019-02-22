
import {ClaimsCache} from '../framework/oauth/claimsCache';
import {OAuthConfiguration} from '../framework/oauth/oauthConfiguration';
import {ClaimsFactory} from '../framework/utilities/claimsFactory';
import {BasicApiClaims} from '../logic/entities/basicApiClaims';

/*
 * A utility class to ceal with generic object creation
 */
export class BasicApiClaimsFactory implements ClaimsFactory<BasicApiClaims> {

    private _configuration: OAuthConfiguration;

    public constructor(configuration: OAuthConfiguration) {
        this._configuration = configuration;
    }

    public createEmptyClaims(): BasicApiClaims {
        return new BasicApiClaims();
    }

    public createClaimsCache(): ClaimsCache<BasicApiClaims> {
        return new ClaimsCache<BasicApiClaims>(this._configuration);
    }
}
