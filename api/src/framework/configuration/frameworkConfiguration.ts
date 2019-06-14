import {OAuthConfiguration} from './oauthConfiguration';

/*
 * Framework configuration settings
 */
export interface FrameworkConfiguration {
    apiName: string;
    oauth: OAuthConfiguration;
    loggers: any;
}
