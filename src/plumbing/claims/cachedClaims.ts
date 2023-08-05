import {CustomClaims} from './customClaims.js';

/*
 * Claims that are cached between API requests
 */
export class CachedClaims {

    private _customClaims: CustomClaims;

    public constructor(customClaims: CustomClaims) {
        this._customClaims = customClaims;
    }

    public get custom(): CustomClaims {
        return this._customClaims;
    }
}
