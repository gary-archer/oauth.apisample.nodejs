import {Request} from 'express';
import {CoreApiClaims} from './coreApiClaims';

/*
 * Concrete APIs can override this class to add custom claims to the cache
 * @typescript-eslint/no-unused-vars:disable
 */
export class CustomClaimsProvider<TClaims extends CoreApiClaims> {

    /* eslint-disable @typescript-eslint/no-unused-vars */
    public async addCustomClaims(accessToken: string, request: Request, claims: TClaims): Promise<void> {
    }
}
