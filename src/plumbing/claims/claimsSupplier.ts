import {CoreApiClaims} from './coreApiClaims';
import {CustomClaimsProvider} from './customClaimsProvider';

/*
 * This class is injected into the OAuth authorizer class at runtime
 * Due to generic type erasure, the authorizer needs a callback to 'new up' TClaims items
 */
export class ClaimsSupplier<TClaims extends CoreApiClaims> {

    /*
     * Plumbing to enable common code to create the correct generic type at runtime
     * We need to pass in a constructor function plus paremters for constructor arguments
     */
    public static createInstance<TClaimsSupplier, TClaims extends CoreApiClaims>(
        construct: new (c: () => TClaims, cp: () => CustomClaimsProvider<TClaims>) => TClaimsSupplier,
        claimsSupplier: () => TClaims,
        customClaimsProviderSupplier: () => CustomClaimsProvider<TClaims>): TClaimsSupplier {

        return new construct(claimsSupplier, customClaimsProviderSupplier);
    }

    private _claimsSupplier: () => TClaims;
    private _customClaimsProviderSupplier: () => CustomClaimsProvider<TClaims>;

    public constructor(
        claimsSupplier: () => TClaims,
        customClaimsProviderSupplier: () => CustomClaimsProvider<TClaims>) {

        this._claimsSupplier = claimsSupplier;
        this._customClaimsProviderSupplier = customClaimsProviderSupplier;
    }

    /*
     * Create new claims of the concrete API's type
     */
    public createEmptyClaims(): TClaims {
        return this._claimsSupplier();
    }

    /*
     * Create a new custom claims provider of the concrete API's type
     */
    public createCustomClaimsProvider(): CustomClaimsProvider<TClaims> {
        return this._customClaimsProviderSupplier();
    }
}
