import * as cache from 'memory-cache';
import * as jshash from 'js-sha256';
import ApiLogger from './apiLogger';

/*
 * A simple in memory claims cache for our API
 */
export default class ClaimsCache {
    
    /*
     * Add claims to the cache until the token's time to live
     */
    public static addClaimsForToken(accessToken: string, expirySeconds: number, claims: any): void {
        
        // Use the exp field returned from introspection to work out the token expiry time
        let epochSeconds = Math.floor(<any>new Date() / 1000);
        let secondsToCache = expirySeconds - epochSeconds;
        ApiLogger.info('ClaimsCache', `Caching received token for ${secondsToCache} seconds`);

        // Cache the token until it expires
        let hash = jshash.sha256(accessToken);
        cache.put(hash, JSON.stringify(claims), secondsToCache * 1000);
    }
    
    /*
     * Get claims from the cache or return null if not found
     */
    public static getClaimsForToken(accessToken: string): any {
        
        let hash = jshash.sha256(accessToken);
        let claims = cache.get(hash);
        if (claims === null) {
            ApiLogger.info('ClaimsCache', `No existing token found for hash ${hash}`);
            return null;
        }
        else {
            ApiLogger.info('ClaimsCache', `Found existing token for hash ${hash}`);
            return JSON.parse(claims);
        }
    }
}