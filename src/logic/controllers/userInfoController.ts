import {inject, injectable} from 'inversify';
import {Get, JsonController} from 'routing-controllers';
import {FRAMEWORKTYPES} from '../../framework';
import {BasicApiClaims} from '../entities/basicApiClaims';
import {UserInfoClaims} from '../entities/userInfoClaims';
/*
 * A controller class to return user info
 */
@injectable()
@JsonController('/api/userclaims')
export class UserInfoController {

    private readonly _claims: BasicApiClaims;

    public constructor(@inject(FRAMEWORKTYPES.ApiClaims) claims: BasicApiClaims) {

        // TODO: We get the default empty object claims so recreate them here
        // https://github.com/typestack/routing-controllers/pull/497
        claims = new BasicApiClaims();
        claims.setTokenInfo('USERID', 'CLIENTID', ['openid']);
        claims.setCentralUserInfo('Fred', 'Flintstone', 'fred@bedrock.com');
        claims.accountsCovered = [1, 2, 4];

        this._claims = claims;
    }

    /*
     * Return any user claims needed by the UI
     */
    @Get('/current')
    public getUserClaims(): UserInfoClaims {

        return {
            givenName: this._claims.givenName,
            familyName: this._claims.familyName,
            email: this._claims.email,
        } as UserInfoClaims;
    }
}
