
import {ClaimsCache} from '../framework/oauth/claimsCache';
import {CustomClaimsProvider} from '../framework/oauth/customClaimsProvider';
import {OAuthConfiguration} from '../framework/oauth/oauthConfiguration';
import {ClaimsFactory} from '../framework/utilities/claimsFactory';
import {BasicApiClaimsProvider} from '../logic/authorization/basicApiClaimsProvider';
import {BasicApiClaims} from '../logic/entities/basicApiClaims';

/*
 * A utility class injected into the framework to deal with creating new generic objects
 * Typescript loses type information at runtime so this works around type erasure issues
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

    public createCustomClaimsProvider(): CustomClaimsProvider<BasicApiClaims> {
        return new BasicApiClaimsProvider();
    }
}
