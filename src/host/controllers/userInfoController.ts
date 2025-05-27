import {Request, Response} from 'express';
import {inject} from 'inversify';
import {SampleExtraClaims} from '../../logic/claims/sampleExtraClaims.js';
import {ClaimsPrincipal} from '../../plumbing/claims/claimsPrincipal.js';
import {BASETYPES} from '../../plumbing/dependencies/baseTypes.js';
import {ResponseWriter} from '../../plumbing/utilities/responseWriter.js';

/*
 * Return user info from the business data to the client
 * These values are separate to the core identity data returned from the OAuth user info endpoint
 */
export class UserInfoController {

    private readonly claims: SampleExtraClaims;

    public constructor(@inject(BASETYPES.ClaimsPrincipal) claims: ClaimsPrincipal) {
        this.claims = claims.getExtra() as SampleExtraClaims;
        this.setupCallbacks();
    }

    /*
     * Return user attributes that are not stored in the authorization server that the UI needs
     */
    public async getUserInfo(request: Request, response: Response): Promise<void> {

        const result = {
            title: this.claims.getTitle(),
            regions: this.claims.getRegions(),
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
