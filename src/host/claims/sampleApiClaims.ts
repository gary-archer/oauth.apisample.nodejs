import {injectable} from 'inversify';
import {CoreApiClaims} from '../../plumbing/claims/coreApiClaims';

/*
 * An example of using custom claims
 */
@injectable()
export class SampleApiClaims extends CoreApiClaims {

    private _regionsCovered!: string[];

    public get regionsCovered(): string[] {
        return this._regionsCovered;
    }

    public set regionsCovered(value: string[]) {
        this._regionsCovered = value;
    }
}
