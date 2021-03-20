import {Request} from 'express';
import {ApiClaims} from '../claims/apiClaims';
import {CustomClaimsProvider} from '../claims/customClaimsProvider';
import {BASETYPES} from '../dependencies/baseTypes';
import {ChildContainerHelper} from '../dependencies/childContainerHelper';
import {ErrorFactory} from '../errors/errorFactory';
import {LogEntryImpl} from '../logging/logEntryImpl';
import {BaseAuthorizer} from '../security/baseAuthorizer';
import {OAuthClient} from './oauthClient';

/*
 * An authorizer that relies on the advanced features of the Authorization Server to provide claims
 * This is the preferred option when supported, since it leads to simpler code and better security
 */
export class StandardAuthorizer extends BaseAuthorizer {

    /*
     * Do the OAuth processing via the middleware class
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    protected async execute(
        request: Request,
        customClaimsProvider: CustomClaimsProvider,
        logEntry: LogEntryImpl): Promise<ApiClaims> {

        // First read the access token
        const accessToken = super.readAccessToken(request);
        if (!accessToken) {
            throw ErrorFactory.createClient401Error('No access token was supplied in the bearer header');
        }

        // Get the child container for this HTTP request
        const perRequestContainer = ChildContainerHelper.resolve(request);

        // Get an OAuth client for this request and validate the token
        const client = perRequestContainer.get<OAuthClient>(BASETYPES.OAuthClient);
        const tokenData = await client.validateToken(accessToken);

        // Ask the custom claims provider to create the final claims object
        return customClaimsProvider.readClaims(tokenData);
    }
}
