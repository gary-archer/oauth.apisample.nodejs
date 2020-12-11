import {injectable} from 'inversify';
import {CoreApiClaims} from '../../plumbing/claims/coreApiClaims';

/*
 * Extend core claims for this particular API
 */
@injectable()
export class SampleApiClaims extends CoreApiClaims {

    private _regionsCovered: string[];

    /*
     * Give fields default values
     */
    public constructor() {
        super();
        this._regionsCovered = [];
    }

    public get regionsCovered(): string[] {
        return this._regionsCovered;
    }

    public set regionsCovered(value: string[]) {
        this._regionsCovered = value;
    }
}
