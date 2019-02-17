import {NextFunction, Request, Response} from 'express';
import {injectable} from 'inversify';
import {interfaces} from 'inversify-express-utils';
import {BasicApiClaims} from '../entities/BasicApiClaims';
import {CustomPrincipal} from './customPrincipal';

/*
 * Our custom authorization filter
 */
@injectable()
export class CustomAuthProvider implements interfaces.AuthProvider {

    /*
     * The entry point for implementing authorization
     */
    public async getUser(request: Request, response: Response, next: NextFunction): Promise<interfaces.Principal> {

        if (request.originalUrl.startsWith('/api/') && request.method !== 'OPTIONS') {

            // TODO: Wire up claims processing properly
            const claims = new BasicApiClaims();
            claims.setTokenInfo('myuserid', 'myclientid', ['openid', 'email', 'profile']);
            claims.setCentralUserInfo('Guest', 'UserX', 'guestuser@authguidance.com');
            claims.accountsCovered = [1, 2, 4];

            console.log('*** IN CUSTOM AUTH PROVIDER - RETURNING USER');
            return new CustomPrincipal(claims);
        }

        return null;
    }
}
