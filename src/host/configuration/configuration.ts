import {LoggingConfiguration} from '../../plumbing/configuration/loggingConfiguration.js';
import {OAuthConfiguration} from '../../plumbing/configuration/oauthConfiguration.js';
import {ApiConfiguration} from './apiConfiguration.js';

/*
 * A holder for configuration settings
 */
export interface Configuration {

    // API specific configuration
    api: ApiConfiguration;

    // Common logging configuration
    logging: LoggingConfiguration;

    // Common OAuth configuration
    oauth: OAuthConfiguration;
}
