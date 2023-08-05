import {BaseClaims} from './baseClaims.js';
import {CustomClaims} from './customClaims.js';

/*
 * The total set of claims for this API
 */
export class ClaimsPrincipal {

    private _baseClaims: BaseClaims;
    private _customClaims: CustomClaims;

    public constructor(baseClaims: BaseClaims, customClaims: CustomClaims) {
        this._baseClaims = baseClaims;
        this._customClaims = customClaims;
    }

    public get token(): BaseClaims {
        return this._baseClaims;
    }

    public get custom(): CustomClaims {
        return this._customClaims;
    }
}
