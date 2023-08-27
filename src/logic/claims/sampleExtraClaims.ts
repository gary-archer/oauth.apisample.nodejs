import {ExtraClaims} from '../../plumbing/claims/extraClaims.js';

/*
 * Represents extra claims not received in access tokens
 */
export class SampleExtraClaims extends ExtraClaims {

    private readonly _title: string;
    private readonly _regions: string[];
    private _managerId: string | null;
    private _role: string | null;

    public static importData(data: any): SampleExtraClaims {

        // These claims are always stored in the cache
        const claims = new SampleExtraClaims(data.title, data.regions);

        // These are only stored in the cache when the authorization server cannot issue them to access tokens
        const managerId = data.managerId;
        const role = data.role;
        if (managerId && role) {
            claims.addMainClaims(managerId, role);
        }

        return claims;
    }

    public constructor(title: string, regions: string[]) {
        super();
        this._title = title;
        this._regions = regions;
        this._managerId = null;
        this._role = null;
    }

    public get title(): string {
        return this._title;
    }

    public get regions(): string[] {
        return this._regions;
    }

    public get managerId(): string | null {
        return this._managerId;
    }

    public get role(): string | null {
        return this._role;
    }

    /*
     * These values should be issued to the access token and store in the JWT claims
     * When not supported by the authorization server they are stored in this class instead
     */
    public addMainClaims(managerId: string, role: string): void {
        this._managerId = managerId;
        this._role = role;
    }

    public exportData(): any {

        // These claims are always stored in the cache
        const data: any = {
            'title': this._title,
            'regions': this._regions,
        };

        // These are only stored in the cache when the authorization server cannot issue them to access tokens
        if (this._managerId && this._role) {
            data.managerId = this._managerId;
            data.role = this._role;
        }

        return data;
    }
}
