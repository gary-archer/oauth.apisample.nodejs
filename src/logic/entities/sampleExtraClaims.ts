import {ExtraClaims} from '../../plumbing/claims/extraClaims.js';

/*
 * Some example claims that may not be present in the access token
 * In some cases this may be due to authorization server limitations
 * In other cases they may be easier to manage outside the authorization server
 * The API's service logic treats such values as claims though
 */
export class SampleExtraClaims extends ExtraClaims {

    private _managerId: string;
    private _role: string;
    private _regions: string[];

    public static importData(data: any): SampleExtraClaims {
        return new SampleExtraClaims(data.managerId, data.role, data.regions);
    }

    public constructor(managerId: string, role: string, regions: string[]) {
        super();
        this._managerId = managerId;
        this._role = role;
        this._regions = regions;
    }

    public get managerId(): string {
        return this._managerId;
    }

    public get role(): string {
        return this._role;
    }

    public get regions(): string[] {
        return this._regions;
    }

    public exportData(): any {

        return {
            'managerId': this._managerId,
            'role': this._role,
            'regions': this._regions,
        };
    }
}
