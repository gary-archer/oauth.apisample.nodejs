/*
 * Export framework public types but not internal classes
 */

import {FrameworkConfiguration} from './configuration/frameworkConfiguration';
import {FRAMEWORKTYPES} from './configuration/frameworkTypes';
import {ApiError} from './errors/apiError';
import {ClientError} from './errors/clientError';
import {UnhandledPromiseRejectionHandler} from './errors/unhandledPromiseRejectionHandler';
import {DefaultCustomClaimsProvider} from './extensibility/defaultCustomClaimsProvider';
import {IClientError} from './extensibility/iclientError';
import {ICustomClaimsProvider} from './extensibility/icustomClaimsProvider';
import {ILogEntry} from './logging/ilogEntry';
import {ILoggerFactory} from './logging/iloggerFactory';
import {IPerformanceBreakdown} from './logging/iperformanceBreakdown';
import {LoggerFactory} from './logging/loggerFactory';
import {BaseAuthorizer} from './security/baseAuthorizer';
import {CoreApiClaims} from './security/coreApiClaims';
import {FrameworkInitialiser} from './startup/frameworkInitialiser';
import {HeaderAuthorizerBuilder} from './startup/headerAuthorizerBuilder';
import {OAuthAuthorizerBuilder} from './startup/oauthAuthorizerBuilder';
import {DebugProxyAgent} from './utilities/debugProxyAgent';
import {IDisposable} from './utilities/idisposable';
import {using} from './utilities/using';

export {
    FrameworkConfiguration,
    FrameworkInitialiser,
    FRAMEWORKTYPES,
    ApiError,
    ClientError,
    UnhandledPromiseRejectionHandler,
    DefaultCustomClaimsProvider,
    IClientError,
    ICustomClaimsProvider,
    ILogEntry,
    ILoggerFactory,
    IPerformanceBreakdown,
    LoggerFactory,
    BaseAuthorizer,
    HeaderAuthorizerBuilder,
    OAuthAuthorizerBuilder,
    CoreApiClaims,
    DebugProxyAgent,
    IDisposable,
    using,
};
