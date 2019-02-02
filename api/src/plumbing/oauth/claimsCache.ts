import * as hasher from 'js-sha256';
import * as NodeCache from 'node-cache';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {CoreApiClaims} from './coreApiClaims';

/*
 * A simple in memory claims cache for our API
 */
export class ClaimsCache {

    /*
     * The singleton cache
     */
    private _cache: NodeCache;

    /*
     * Create the cache at application startup
     */
    public constructor(configuration: OAuthConfiguration) {

        // Create the cache and set a default time to live in seconds
        const defaultExpirySeconds = configuration.defaultTokenCacheMinutes * 60;
        this._cache = new NodeCache({
            stdTTL: defaultExpirySeconds,
        });

        // If required add debug output here to verify expiry occurs when expected
        // this._cache.on('expired', (key: string, value: any) => {
        // });
    }

    /*
     * Add claims to the cache until the token's time to live
     */
    public async addClaimsForToken(accessToken: string, expiry: number, claims: CoreApiClaims): Promise<void> {

        // Use the exp field returned from introspection to work out the token expiry time
        const epochSeconds = Math.floor((new Date() as any) / 1000);
        const secondsToCache = expiry - epochSeconds;
        if (secondsToCache > 0) {

            // Cache the token until it expires
            const hash = hasher.sha256(accessToken);
            await this._cache.set(hash, JSON.stringify(claims.serializePrivateFields()), secondsToCache);
        }
    }

    /*
     * Get claims from the cache or return null if not found
     */
    public async getClaimsForToken(accessToken: string, claims: CoreApiClaims): Promise<boolean> {

        // Get the token hash and see if it exists in the cache
        const hash = hasher.sha256(accessToken);
        const claimsJson = await this._cache.get<string>(hash);
        if (claimsJson) {

            // If so then return cached claims
            claims.deserializePrivateFields(JSON.parse(claimsJson));
            return true;
        }

        // Otherwise it is a new token and we need to do claims processing
        return false;
    }
}
