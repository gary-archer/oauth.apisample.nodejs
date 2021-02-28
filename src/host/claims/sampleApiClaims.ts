import {injectable} from 'inversify';
import {CoreApiClaims} from '../../plumbing/claims/coreApiClaims';

/*
 * Extend core claims for this particular API
 */
@injectable()
export class SampleApiClaims extends CoreApiClaims {

    // Domain specific claims that control access to business data
    public _isAdmin: boolean;
    private _regionsCovered: string[];

    public constructor() {
        super();
        this._isAdmin = false;
        this._regionsCovered = [];
    }

    public get isAdmin(): boolean {
        return this._isAdmin;
    }

    public set isAdmin(value: boolean) {
        this._isAdmin = value;
    }

    public get regionsCovered(): string[] {
        return this._regionsCovered;
    }

    public set regionsCovered(value: string[]) {
        this._regionsCovered = value;
    }
}
