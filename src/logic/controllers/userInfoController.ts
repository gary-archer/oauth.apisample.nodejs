import {Request, Response} from 'express';
import {inject, injectable} from 'inversify';
import {FRAMEWORKTYPES, ResponseWriter} from '../../framework';
import {BasicApiClaims} from '../entities/basicApiClaims';
import {UserInfoClaims} from '../entities/userInfoClaims';
/*
 * A controller class to return user info
 */
@injectable()
export class UserInfoController {

    private readonly _claims: BasicApiClaims;

    public constructor(@inject(FRAMEWORKTYPES.ApiClaims) claims: BasicApiClaims) {
        this._claims = claims;
        this._setupCallbacks();
    }

    /*
     * Return any user claims needed by the UI
     */
    public getUserClaims(request: Request, response: Response): void {

        const userInfo = {
            givenName: this._claims.givenName,
            familyName: this._claims.familyName,
            email: this._claims.email,
        } as UserInfoClaims;
        new ResponseWriter().writeObjectResponse(response, 200, userInfo);
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private _setupCallbacks(): void {
        this.getUserClaims = this.getUserClaims.bind(this);
    }
}
