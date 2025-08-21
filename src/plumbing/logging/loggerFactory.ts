import {Logger} from 'winston';
import {LoggingConfiguration} from '../configuration/loggingConfiguration.js';

/*
 * An interface to create and get logger objects
 */
export interface LoggerFactory {

    // Configuration at startup
    configure(configuration: LoggingConfiguration): void;

    // Handle exceptions starting the API
    logStartupError(exception: any): void;

    // Get the request logger
    getRequestLogger(): Logger | null;

    // Get the audit logger
    getAuditLogger(): Logger | null;

    // Get a named debug logger
    getDebugLogger(name: string): Logger | null;
}
