import {Request, Response} from 'express';
import {inject} from 'inversify';
import {ClaimsPrincipal} from '../../plumbing/claims/claimsPrincipal.js';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes.js';
import {ResponseWriter} from '../../plumbing/utilities/responseWriter.js';

/*
 * This user info is separate to the OpenID Connect user info that returns core user attributes
 */
export class UserInfoController {

    private readonly claims: ClaimsPrincipal;

    public constructor(@inject(BASETYPES.ClaimsPrincipal) claims: ClaimsPrincipal) {
        this.claims = claims;
        this.setupCallbacks();
    }

    /*
     * Return product specific user info from the API to clients
     */
    public async getUserInfo(request: Request, response: Response): Promise<void> {

        const result = {
            title: this.claims.getExtra().title,
            regions: this.claims.getExtra().regions,
        };
        ResponseWriter.writeSuccessResponse(response, 200, result);
    }

    /*
     * Plumbing to ensure the this parameter is available
     */
    private setupCallbacks(): void {
        this.getUserInfo = this.getUserInfo.bind(this);
    }
}
