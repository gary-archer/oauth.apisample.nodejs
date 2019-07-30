import {Logger} from 'winston';
import {FrameworkConfiguration} from '../configuration/frameworkConfiguration';

/*
 * An interface that allows business logic to access logging objects
 */
export interface ILoggerFactory {

    // Configuration at startup
    configure(configuration: FrameworkConfiguration): void;

    // Used to log startup messages
    createStartupConsoleLogger(name: string): Logger;

    // Handle exceptions starting the API
    logStartupError(exception: any): void;

    // Get a debug text logger for a developer PC
    getDevelopmentLogger(className: string): Logger;
}
