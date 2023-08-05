import {JWTPayload} from 'jose';
import {ErrorUtils} from '../errors/errorUtils.js';
import {BaseClaims} from './baseClaims.js';

/*
 * A utility for gathering claims
 */
export class ClaimsReader {

    /*
     * Return the base claims in a JWT that the API is interested in
     */
    public static baseClaims(payload: JWTPayload): BaseClaims {

        const subject = ClaimsReader._readClaim(payload, 'sub');
        const scopes = ClaimsReader._readClaim(payload, 'scope').split(' ');
        const expiry = parseInt(ClaimsReader._readClaim(payload, 'exp'), 10);
        return new BaseClaims(subject, scopes, expiry);
    }

    /*
     * Sanity checks when receiving claims to avoid failing later with a cryptic error
     */
    private static _readClaim(payload: any, name: string): string {

        const value = payload[name];
        if (!value) {
            throw ErrorUtils.fromMissingClaim(name);
        }

        return value as string;
    }
}
