import {NextFunction, Request, Response} from 'express';
import {inject, injectable} from 'inversify';
import {interfaces} from 'inversify-express-utils';
import {BasicApiClaims} from '../entities/BasicApiClaims';
import {IssuerMetadata} from '../framework/oauth/issuerMetadata';
import {CustomPrincipal} from './customPrincipal';

/*
 * A singleton to act as the Express entry point for authentication processing
 */
@injectable()
export class CustomAuthProvider implements interfaces.AuthProvider {

    // TODO: Add some set methods here

    /*
     * The entry point for implementing authorization
     */
    public async getUser(request: Request, response: Response, next: NextFunction): Promise<interfaces.Principal> {

        if (request.originalUrl.startsWith('/api/') && request.method !== 'OPTIONS') {

            console.log('*** getUser for API request: ' + request.originalUrl);

            // TODO: Wire up claims processing properly
            const claims = new BasicApiClaims();
            claims.setTokenInfo('myuserid', 'myclientid', ['openid', 'email', 'profile']);
            claims.setCentralUserInfo('Guest', 'UserX', 'guestuser@authguidance.com');
            claims.accountsCovered = [1, 2, 4];

            return new CustomPrincipal(claims);
        }

        return null;
    }
}
