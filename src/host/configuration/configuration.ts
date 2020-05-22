import {LoggingConfiguration} from '../../framework-api-base';
import {OAuthConfiguration} from '../../framework-api-oauth';
import {ApiConfiguration} from './apiConfiguration';

/*
 * A holder for configuration settings
 */
export interface Configuration {
    api: ApiConfiguration;
    logging: LoggingConfiguration;
    oauth: OAuthConfiguration;
}
