import {CustomClaims} from '../../plumbing/claims/customClaims';

/*
 * Extend core claims for this particular API
 */
export class SampleCustomClaims extends CustomClaims {

    private _userDatabaseId: string;
    private _userRole: string;
    private _regionsCovered: string[];

    public static importData(data: any): SampleCustomClaims {
        return new SampleCustomClaims(data.userDatabaseId, data.userRole, data.regionsCovered);
    }

    public constructor(userDatabaseId: string, userRole: string, regionsCovered: string[]) {
        super();
        this._userDatabaseId = userDatabaseId;
        this._userRole = userRole;
        this._regionsCovered = regionsCovered;
    }

    public get userDatabaseId(): string {
        return this._userDatabaseId;
    }

    public get userRole(): string {
        return this._userRole;
    }

    public get regionsCovered(): string[] {
        return this._regionsCovered;
    }

    public exportData(): any {

        return {
            'userDatabaseId': this._userDatabaseId,
            'userRole': this._userRole,
            'regionsCovered': this._regionsCovered,
        };
    }
}
