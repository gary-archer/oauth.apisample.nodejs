import {injectable} from 'inversify';
import NodeCache from 'node-cache';
import {Logger} from 'winston';
import {LoggerFactory} from '../logging/loggerFactory.js';
import {ExtraClaims} from './extraClaims.js';

/*
 * A singleton memory cache for extra authorization values
 */
@injectable()
export class ClaimsCache {

    private readonly cache: NodeCache;
    private readonly defaultTimeToLiveSeconds: number;
    private readonly debugLogger: Logger | null;

    /*
     * Create the cache at application startup
     */
    public constructor(timeToLiveMinutes: number, loggerFactory: LoggerFactory) {

        this.debugLogger = loggerFactory.getDebugLogger(ClaimsCache.name);

        this.defaultTimeToLiveSeconds = timeToLiveMinutes * 60;
        this.cache = new NodeCache({
            stdTTL: this.defaultTimeToLiveSeconds,
        });

        /* eslint-disable @typescript-eslint/no-unused-vars */
        this.cache.on('expired', (key: string, claims: ExtraClaims) => {
            this.debugLogger?.debug(`Expired item has been removed from the cache (hash: ${key})`);
        });
    }

    /*
     * Add an item to the cache and do not exceed the token's expiry or the configured time to live
     */
    public setItem(accessTokenHash: string, claims: ExtraClaims, exp: number): void {

        const epochSeconds = Math.floor((new Date().getTime()) / 1000);
        let secondsToCache = exp - epochSeconds;
        if (secondsToCache > 0) {

            if (secondsToCache > this.defaultTimeToLiveSeconds) {
                secondsToCache = this.defaultTimeToLiveSeconds;
            }

            this.debugLogger?.debug(
                `Adding item to cache for ${secondsToCache} seconds (hash: ${accessTokenHash})`);
            this.cache.set(accessTokenHash, claims, secondsToCache);
        }
    }

    /*
     * Get an item from the cache for this token's hash, or return null if not found
     */
    public getItem(accessTokenHash: string): ExtraClaims | null  {

        const claims = this.cache.get<ExtraClaims>(accessTokenHash);
        if (!claims) {
            return null;
        }

        this.debugLogger?.debug(`Found existing item in cache (hash: ${accessTokenHash})`);
        return claims;
    }
}
