import {Request} from 'express';
import {FRAMEWORKINTERNALTYPES} from '../configuration/frameworkInternalTypes';
import {FRAMEWORKPUBLICTYPES} from '../configuration/frameworkPublicTypes';
import {UnhandledExceptionHandler} from '../errors/unhandledExceptionHandler';
import {ChildContainerHelper} from '../utilities/childContainerHelper';
import {BaseAuthorizer} from './baseAuthorizer';
import {CoreApiClaims} from './coreApiClaims';
import {HeaderAuthenticator} from './headerAuthenticator';

/*
 * A simple authorizer for private subnet APIs, to receive claims via headers
 */
export class HeaderAuthorizer extends BaseAuthorizer {

    public constructor(unsecuredPaths: string[], exceptionHandler: UnhandledExceptionHandler) {
        super(unsecuredPaths, exceptionHandler);
    }

    /*
     * Do the work to process headers and extract claims
     */
    protected async execute(request: Request): Promise<CoreApiClaims> {

        // Get the child container for this HTTP request
        const container = ChildContainerHelper.resolve(request);

        // Resolve the authenticator class and ask it to do the work
        const authenticator = container.get<HeaderAuthenticator>(FRAMEWORKINTERNALTYPES.HeaderAuthenticator);
        const claims = await authenticator.authorizeRequestAndGetClaims(request);

        // Rebind claims to this requests's child container so that they are injectable into business logic
        container.bind<CoreApiClaims>(FRAMEWORKPUBLICTYPES.ApiClaims).toConstantValue(claims);
        return claims;
    }
}
