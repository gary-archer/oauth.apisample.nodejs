import winston, {LoggerOptions} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import Transport from 'winston-transport';
import {LoggingConfiguration} from '../configuration/loggingConfiguration.js';
import {ErrorUtils} from '../errors/errorUtils.js';
import {LogEntryImpl} from './logEntryImpl.js';
import {LoggerFactory} from './loggerFactory.js';

/*
 * Technical logger names
 */
const ROOT_DEVELOPMENT_LOGGER_NAME = 'root';
const PRODUCTION_LOGGER_NAME = 'production';

/*
 * The logger factory implementation to manage winston and creating log entries
 */
export class LoggerFactoryImpl implements LoggerFactory {

    private apiName: string;
    private performanceThresholdMilliseconds: number;

    /*
     * We create the logger factory before reading configuration, since we need to log problems loading configuration
     */
    public constructor() {

        // Initialise logging fields
        this.apiName = '';
        this.performanceThresholdMilliseconds = 1000;

        // Initialise console colours
        winston.addColors({
            error: 'red',
            warn: 'yellow',
            info: 'white',
            debug: 'blue',
        });
    }

    /*
     * Configure at application startup from a dynamic object
     */
    public configure(configuration: LoggingConfiguration): void {

        // Initialise behaviour
        this.apiName = configuration.apiName;
        this.performanceThresholdMilliseconds = configuration.production.performanceThresholdMilliseconds;

        // Create the production logger
        const productionLogConfig = configuration.production;
        this.createProductionLogger(productionLogConfig.level, productionLogConfig.transports);

        // Create development loggers
        const developmentLogConfig = configuration.development;
        this.createDevelopmentLoggers(developmentLogConfig);
    }

    /*
     * Special handling for startup errors
     */
    public logStartupError(exception: any): void {

        // Create a default production logger if configuration is not loaded yet
        if (!winston.loggers.has(PRODUCTION_LOGGER_NAME)) {
            this.createProductionLogger('info', [{type: 'console'}]);
        }

        // Get the error into a loggable format
        const error = ErrorUtils.createServerError(exception);

        // Create a log entry and set error details
        const logEntry = new LogEntryImpl(
            this.apiName,
            this.getProductionLogger(),
            this.performanceThresholdMilliseconds);

        logEntry.setOperationName('startup');
        logEntry.setServerError(error);
        logEntry.write();
    }

    /*
     * Return the requested 'logger per class' or the default logger if not found
     */
    public getDevelopmentLogger(name: string): winston.Logger {

        if (winston.loggers.has(name)) {
            return winston.loggers.get(name);
        }

        return (winston as any);
    }

    /*
     * Create a log entry at the start of an API request
     * Also set performance threshold details, which can be customised for specific operations
     */
    public createLogEntry(): LogEntryImpl {

        return new LogEntryImpl(this.apiName, this.getProductionLogger(), this.performanceThresholdMilliseconds);
    }

    /*
     * There is a single production logger which writes a structured and queryable log entry for each API request
     * It should be configured to be always on in all environments
     */
    private createProductionLogger(level: string, transportsConfig: any[]): void {

        const transports = [];

        // Create a pretty print formatter for productivity
        const prettyPrintFormatter = winston.format.combine(
            winston.format.printf((logEntry: any) => {
                return JSON.stringify(logEntry.message, null, 2);
            }));

        // Create a bare JSON formatter with a log entry per line, for log shippers
        const bareJsonFormatter = winston.format.combine(
            winston.format.printf((logEntry: any) => {
                return JSON.stringify(logEntry.message);
            }));

        // Create the console transport, which is used for log shipping in Kubernetes
        const consoleTransportConfig = transportsConfig.find((a: any) => a.type === 'console');
        if (consoleTransportConfig) {
            const consoleTransport = new winston.transports.Console();
            if (consoleTransport) {
                consoleTransport.format =
                    consoleTransportConfig.prettyPrint ? prettyPrintFormatter : bareJsonFormatter;
                transports.push(consoleTransport);
            }
        }

        // Create the file transport, which is used for log shipping from a developer PC
        const fileTransportConfig = transportsConfig.find((a: any) => a.type === 'file');
        if (fileTransportConfig) {
            const fileTransport = this.createFileTransport(fileTransportConfig);
            if (fileTransport) {
                fileTransport.format = bareJsonFormatter;
                transports.push(fileTransport);
            }
        }

        const loggerOptions = {
            level,
            transports,
        } as LoggerOptions;

        winston.loggers.add(PRODUCTION_LOGGER_NAME, loggerOptions);
    }

    /*
     * Return the production logger, which logs every request as a JSON object
     */
    private getProductionLogger(): winston.Logger {
        return winston.loggers.get(PRODUCTION_LOGGER_NAME);
    }

    /*
     * Development loggers run only on a developer PC and should be used sparingly
     * The output is not useful in production since it has insufficient context and is not queryable
     */
    private createDevelopmentLoggers(developmentLogConfig: any): void {

        // Create the root logger
        this.createDevelopmentLogger(ROOT_DEVELOPMENT_LOGGER_NAME, developmentLogConfig.level);

        // Add extra loggers per class if configured
        if (developmentLogConfig.overrideLevels) {
            for (const name in developmentLogConfig.overrideLevels) {
                if (name) {

                    const level = developmentLogConfig.overrideLevels[name];
                    this.createDevelopmentLogger(name, level);
                }
            }
        }
    }

    /*
     * Create a single development logger
     * Development loggers intentionally only support a console logger
     */
    private createDevelopmentLogger(name: string, level: string): void {

        const transports = [];
        transports.push(new winston.transports.Console());

        const options = {
            transports,
            format: this.createDevelopmentFormatter(name),
            level,
        } as LoggerOptions;

        winston.loggers.add(name, options);
    }

    /*
     * A utility method to create the file transport consistently
     */
    private createFileTransport(transportConfig: any): Transport {

        const options = {
            filename: `${transportConfig.filePrefix}-%DATE%.log`,
            dirname: transportConfig.dirname,
            datePattern: 'YYYY-MM-DD',
            maxSize: transportConfig.maxSize,
            maxFiles: transportConfig.maxFiles,
        };

        return new DailyRotateFile(options);
    }

    /*
     * Create the formatter for development text output in a parameterised manner
     */
    private createDevelopmentFormatter(loggerName: string): any {

        return winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf((info: any) => `${info.level}: ${info.timestamp} : ${loggerName} : ${info.message}`),
        );
    }
}
