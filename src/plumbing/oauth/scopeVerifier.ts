import {BaseErrorCodes} from '../errors/baseErrorCodes.js';
import {ErrorFactory} from '../errors/errorFactory.js';

/*
 * A utility class to enforce scopes
 */
export class ScopeVerifier {

    public static enforce(scopes: string[], requiredScope: string): void {

        if (!scopes.some((s) => s.indexOf(requiredScope) !== -1)) {
            this.deny();
        }
    }

    public static deny(): void {

        throw ErrorFactory.createClientError(
            403,
            BaseErrorCodes.insufficientScope,
            'Access to this API endpoint is forbidden');
    }
}
