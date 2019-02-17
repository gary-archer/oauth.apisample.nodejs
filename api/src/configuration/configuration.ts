import {OAuthConfiguration} from '../framework/oauth/oauthConfiguration';
import {AppConfiguration} from './appConfiguration';

/*
 * A holder for configuration settings
 */
export interface Configuration {
    app: AppConfiguration;
    oauth: OAuthConfiguration;
}
