import {injectable} from 'inversify';
import {CoreApiClaims} from '../../framework/oauth/coreApiClaims';

/*
 * Override the core claims to support additional custom claims
 */
@injectable()
export class BasicApiClaims extends CoreApiClaims {

    // Product Specific data used for authorization
    private _accountsCovered!: number[];

    // Accessors
    public get accountsCovered(): number[] {
        return this._accountsCovered;
    }

    public set accountsCovered(accountsCovered: number[]) {
        this._accountsCovered = accountsCovered;
    }

    // Override the base class to add our custom claims
    public serializePrivateFields(): any {
        const data = super.serializePrivateFields();
        data.accountsCovered = this._accountsCovered;
        return data;
    }

    public deserializePrivateFields(data: any): void {
        super.deserializePrivateFields(data);
        this._accountsCovered = data.accountsCovered;
    }
}
