import {ApiConfiguration} from './apiConfiguration.js';
import {LoggingConfiguration} from './loggingConfiguration.js';
import {OAuthConfiguration} from './oauthConfiguration.js';

/*
 * A holder for configuration settings
 */
export interface Configuration {

    api: ApiConfiguration;

    logging: LoggingConfiguration;

    oauth: OAuthConfiguration;
}
