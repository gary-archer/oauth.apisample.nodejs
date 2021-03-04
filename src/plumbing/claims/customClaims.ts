/*
 * An abstraction to support custom claims
 */
export class CustomClaims {

    /* eslint-disable @typescript-eslint/no-unused-vars */
    public static import(data: any): CustomClaims {
        return new CustomClaims();
    }

    public export(): any {
        return {};
    }
}
