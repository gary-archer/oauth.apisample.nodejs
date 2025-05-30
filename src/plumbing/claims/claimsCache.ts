import {injectable} from 'inversify';
import NodeCache from 'node-cache';
import {Logger} from 'winston';
import {LoggerFactory} from '../logging/loggerFactory.js';

/*
 * A simple in memory claims cache for our API
 */
@injectable()
export class ClaimsCache {

    private readonly cache: NodeCache;
    private readonly defaultTimeToLiveSeconds: number;
    private readonly traceLogger: Logger;

    /*
     * Create the cache at application startup
     */
    public constructor(timeToLiveMinutes: number, loggerFactory: LoggerFactory) {

        this.traceLogger = loggerFactory.getDevelopmentLogger(ClaimsCache.name);

        // Create the cache and set a maximum time to live in seconds
        this.defaultTimeToLiveSeconds = timeToLiveMinutes * 60;
        this.cache = new NodeCache({
            stdTTL: this.defaultTimeToLiveSeconds,
        });

        // If required add debug output here to verify expiry occurs when expected
        /* eslint-disable @typescript-eslint/no-unused-vars */
        this.cache.on('expired', (key: string, value: any) => {
            this.traceLogger.debug(`Expired token has been removed from the cache (hash: ${key})`);
        });
    }

    /*
     * Add serialized claims to the cache until the token's time to live
     */
    public setExtraUserClaims(accessTokenHash: string, serializedClaims: string, exp: number): void {

        // Use the exp field to work out the token expiry time
        const epochSeconds = Math.floor((new Date().getTime()) / 1000);
        let secondsToCache = exp - epochSeconds;
        if (secondsToCache > 0) {

            // Output debug info
            this.traceLogger.debug(
                `Token to be cached will expire in ${secondsToCache} seconds (hash: ${accessTokenHash})`);

            // Do not exceed the maximum time we configured
            if (secondsToCache > this.defaultTimeToLiveSeconds) {
                secondsToCache = this.defaultTimeToLiveSeconds;
            }

            // Cache the claims until the above time
            this.traceLogger.debug(
                `Adding token to claims cache for ${secondsToCache} seconds (hash: ${accessTokenHash})`);
            this.cache.set(accessTokenHash, serializedClaims, secondsToCache);
        }
    }

    /*
     * Get serialized claims from the cache or return null if not found
     */
    public getExtraUserClaims(accessTokenHash: string): string | null {

        // Get the token hash and see if it exists in the cache
        const claimsText = this.cache.get<string>(accessTokenHash);
        if (!claimsText) {

            // If this is a new token and we need to do claims processing
            this.traceLogger.debug(`New token will be added to claims cache (hash: ${accessTokenHash})`);
            return null;
        }

        // Otherwise return cached claims
        this.traceLogger.debug(`Found existing token in claims cache (hash: ${accessTokenHash})`);
        return claimsText;
    }
}
