import {LoggingConfiguration} from '../../plumbing/configuration/loggingConfiguration';
import {OAuthConfiguration} from '../../plumbing/configuration/oauthConfiguration';
import {ApiConfiguration} from './apiConfiguration';

/*
 * A holder for configuration settings
 */
export interface Configuration {

    // Application specific configuration
    api: ApiConfiguration;

    // Logging configuration that could be shared between multiple APIs
    logging: LoggingConfiguration;

    // OAuth configuration that could be shared between multiple APIs
    oauth: OAuthConfiguration;
}
