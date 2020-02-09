/*
 * Export framework public types but not internal classes
 */

import {APIFRAMEWORKTYPES} from './src/configuration/apiFrameworkTypes';
import {FrameworkConfiguration} from './src/configuration/frameworkConfiguration';
import {ApiError} from './src/errors/apiError';
import {ApplicationExceptionHandler} from './src/errors/applicationExceptionHandler';
import {BaseErrorCodes} from './src/errors/baseErrorCodes';
import {ClientError} from './src/errors/clientError';
import {ErrorFactory} from './src/errors/errorFactory';
import {LoggerFactory} from './src/logging/loggerFactory';
import {LoggerFactoryBuilder} from './src/logging/loggerFactoryBuilder';
import {UnhandledExceptionHandler} from './src/middleware/unhandledExceptionHandler';
import {BaseAuthorizer} from './src/security/baseAuthorizer';
import {CoreApiClaims} from './src/security/coreApiClaims';
import {FrameworkBuilder} from './src/startup/frameworkBuilder';
import {HeaderAuthorizerBuilder} from './src/startup/headerAuthorizerBuilder';
import {ChildContainerHelper} from './src/utilities/childContainerHelper';
import {DebugProxyAgent} from './src/utilities/debugProxyAgent';

export {
    APIFRAMEWORKTYPES,
    FrameworkBuilder,
    FrameworkConfiguration,
    ApiError,
    ApplicationExceptionHandler,
    BaseErrorCodes,
    ClientError,
    ErrorFactory,
    LoggerFactory,
    LoggerFactoryBuilder,
    UnhandledExceptionHandler,
    BaseAuthorizer,
    CoreApiClaims,
    HeaderAuthorizerBuilder,
    ChildContainerHelper,
    DebugProxyAgent,
};
