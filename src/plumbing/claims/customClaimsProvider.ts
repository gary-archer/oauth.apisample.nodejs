import {Request} from 'express';
import {CoreApiClaims} from './coreApiClaims';

/*
 * Concrete APIs can override this class to add custom claims to the cache
 */
export class CustomClaimsProvider<TClaims extends CoreApiClaims> {

    public async addCustomClaims(accessToken: string, request: Request, claims: TClaims): Promise<void> {
    }
}
