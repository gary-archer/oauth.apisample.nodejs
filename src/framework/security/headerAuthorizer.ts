import {Request} from 'express';
import {FRAMEWORKTYPES} from '../configuration/frameworkTypes';
import {ChildContainerHelper} from '../utilities/childContainerHelper';
import {BaseAuthorizer} from './baseAuthorizer';
import {CoreApiClaims} from './coreApiClaims';
import {HeaderAuthenticator} from './headerAuthenticator';

/*
 * A simple authorizer for private subnet APIs, to receive claims via headers
 */
export class HeaderAuthorizer extends BaseAuthorizer {

    /*
     * Receive dependencies
     */
    public constructor(unsecuredPaths: string[]) {
        super(unsecuredPaths);
    }

    /*
     * Do the work to process headers and extract claims
     */
    protected async execute(request: Request): Promise<CoreApiClaims> {

        // Get the child container for this HTTP request
        const container = ChildContainerHelper.resolve(request);

        // Resolve the authenticator class and ask it to do the work
        const authenticator = container.get<HeaderAuthenticator>(FRAMEWORKTYPES.HeaderAuthenticator);
        const claims = await authenticator.authorizeRequestAndGetClaims(request);

        // Rebind claims to this requests's child container so that they are injectable into business logic
        container.bind<CoreApiClaims>(FRAMEWORKTYPES.ApiClaims).toConstantValue(claims);
        return claims;
    }
}
