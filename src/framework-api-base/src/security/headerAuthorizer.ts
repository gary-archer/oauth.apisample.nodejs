import {Request} from 'express';
import {INTERNALTYPES} from '../configuration/internalTypes';
import {CoreApiClaims} from '../security/coreApiClaims';
import {ChildContainerHelper} from '../utilities/childContainerHelper';
import {BaseAuthorizer} from './baseAuthorizer';
import {HeaderAuthenticator} from './headerAuthenticator';

/*
 * A simple authorizer for private subnet APIs, to receive claims via headers
 */
export class HeaderAuthorizer extends BaseAuthorizer {

    public constructor(unsecuredPaths: string[]) {
        super(unsecuredPaths);
    }

    /*
     * Do the work to process headers and extract claims
     */
    protected async execute(request: Request): Promise<CoreApiClaims> {

        // Get the child container for this HTTP request
        const perRequestContainer = ChildContainerHelper.resolve(request);

        // Resolve the authenticator for this request
        const authenticator = perRequestContainer.get<HeaderAuthenticator>(INTERNALTYPES.HeaderAuthenticator);

        // Ask it to read and return claims headers
        return await authenticator.authorizeRequestAndGetClaims(request);
    }
}
