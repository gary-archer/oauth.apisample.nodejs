/*
 * An abstraction to support custom claims
 */
export class CustomClaims {

    public static import(input: any): CustomClaims {

        const output = {} as any;

        for (const field in input) {
            if (field) {
                output[field] = input[field];
            }
        }

        return output as CustomClaims;
    }

    public export(): any {
        return {};
    }
}
