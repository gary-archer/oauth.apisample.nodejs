import {injectable} from 'inversify';
import {BasicApiClaims} from '../entities/BasicApiClaims';

/*
 * A helper object to allow us to inject our claims
 */
@injectable()
export class BasicApiClaimsAccessor {

    public getClaims(): BasicApiClaims {

        const claims = new BasicApiClaims();
        claims.setTokenInfo('userid', 'clientid', ['openid', 'email', 'profile']);
        claims.setCentralUserInfo('Guest', 'UserX', 'guestuser@authguidance.com');
        claims.accountsCovered = [1, 2, 4];
        return claims;
    }
}
