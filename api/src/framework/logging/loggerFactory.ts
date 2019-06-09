import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as Transport from 'winston-transport';
import {FrameworkConfiguration} from '../configuration/frameworkConfiguration';
import {ExceptionHelper} from '../errors/exceptionHelper';
import {ILoggerFactory} from '../logging/iloggerFactory';
import {LogEntry} from './logEntry';
import {PerformanceThreshold} from './performanceThreshold';

const ROOT_DEVELOPMENT_LOGGER_NAME = 'root';
const PRODUCTION_LOGGER_NAME = 'production';

/*
 * The logger factory implementation to manage winston and creating log entries
 */
export class LoggerFactory implements ILoggerFactory {

    // Base details
    private _logConfiguration: any;
    private _apiName: string;

    // Performance thresholds
    private _defaultPerformanceThresholdMilliseconds: number;
    private _thresholdOverrides: PerformanceThreshold[];

    /*
     * We create the logger factory before reading configuration, since we need to log problems loading configuration
     */
    public constructor() {

        // Initialise logging fields
        this._apiName = '';
        this._defaultPerformanceThresholdMilliseconds = 1000;
        this._thresholdOverrides = [];

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
    public configure(configuration: FrameworkConfiguration): void {

        // Initialise behaviour
        this._logConfiguration = configuration.loggers;
        this._apiName = configuration.apiName;

        // Process the configuration
        this._loadConfiguration();

        // Create the production logger
        const productionLogConfig = this._logConfiguration.production;
        this._createProductionLogger(productionLogConfig.level, productionLogConfig.transports);

        // Create development loggers
        this._createDevelopmentLoggers();
    }

    /*
     * Create a simple text logger for startup messages
     */
    public createStartupConsoleLogger(name: string): winston.Logger {

        const transports = [];

        // Output simple text with the logger name as a prefix
        const formatter = winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf((info) => `${info.level}: ${info.timestamp} : ${name} : ${info.message}`),
        );

        // Support console output
        const consoleTransport = new winston.transports.Console();
        consoleTransport.format = formatter;
        transports.push(consoleTransport);

        // Create the logger and give it a name
        const loggerOptions = {
            level: 'info',
            transports,
        } as winston.LoggerOptions;
        winston.loggers.add(name, loggerOptions);

        // Return the logger
        return winston.loggers.get(name);
    }

    /*
     * Special handling for startup errors
     */
    public logStartupError(exception: any): void {

        // Create a default production logger if configuration is not loaded yet
        if (!winston.loggers.has(PRODUCTION_LOGGER_NAME)) {
            this._createProductionLogger('info', [{type: 'console'}]);
        }

        // Get the logger
        const productionLogger = winston.loggers.get(PRODUCTION_LOGGER_NAME);

        // Get the error into a loggable format
        const error = ExceptionHelper.fromException(exception, this._apiName);

        // Create a log entry and set error details
        const logEntry = new LogEntry(this._apiName);
        logEntry.setPerformanceThresholds(this._defaultPerformanceThresholdMilliseconds, this._thresholdOverrides);
        logEntry.setOperationName('startup');
        logEntry.setError(error);
        logEntry.write(productionLogger);
    }

    /*
     * Return the production logger, which logs every request as a JSON object
     */
    public getProductionLogger(): winston.Logger {
        return winston.loggers.get(PRODUCTION_LOGGER_NAME);
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
    public createLogEntry(): LogEntry {
        const logEntry = new LogEntry(this._apiName);
        logEntry.setPerformanceThresholds(this._defaultPerformanceThresholdMilliseconds, this._thresholdOverrides);
        return logEntry;
    }

    /*
     * Extract performance details from the log configuration, for use later when creating log entries
     */
    private _loadConfiguration() {

        // Read the default performance threshold
        const thresholds = this._logConfiguration.production.performanceThresholdsMilliseconds;

        // Update the default
        if (thresholds.default >= 0) {
            this._defaultPerformanceThresholdMilliseconds = thresholds.default;
        }

        // Support operation specific overrides, which will be set against the log entry on creation
        if (thresholds.operationOverrides) {
            for (const name in thresholds.operationOverrides) {
                if (name) {
                    const milliseconds = thresholds.operationOverrides[name];
                    const performanceThreshold = {
                        name,
                        milliseconds,
                    };

                    this._thresholdOverrides.push(performanceThreshold);
                }
            }
        }
    }

    /*
     * There is a single production logger which writes a structured and queryable log entry for each API request
     * It should be configured to be always on in all environments
     */
    private _createProductionLogger(level: string, transportsConfig: any[]): void {

        const transports = [];

        // Console output uses pretty printing
        const consoleFormatter = winston.format.combine(
            winston.format.printf((logEntry: any) => {
                return JSON.stringify(logEntry.message, null, 2);
            }));

        // File output uses a log entry per line, which works better with log shippers such as logstash
        const fileFormatter = winston.format.combine(
            winston.format.printf((logEntry: any) => {
                return JSON.stringify(logEntry.message);
            }));

        // Create transports, which use different formats
        const consoleTransportConfig = transportsConfig.find((a: any) => a.type === 'console');
        if (consoleTransportConfig) {
            const consoleTransport = new winston.transports.Console();
            if (consoleTransport) {
                consoleTransport.format = consoleFormatter;
                transports.push(consoleTransport);
            }
        }

        const fileTransportConfig = transportsConfig.find((a: any) => a.type === 'file');
        if (fileTransportConfig) {
            const fileTransport = this._createFileTransport(fileTransportConfig);
            if (fileTransport) {
                fileTransport.format = fileFormatter;
                transports.push(fileTransport);
            }
        }

        // Create the logger and give it a name
        const loggerOptions = {
            level,
            transports,
        } as winston.LoggerOptions;
        winston.loggers.add(PRODUCTION_LOGGER_NAME, loggerOptions);
    }

    /*
     * Development loggers run only on a developer PC and should be used sparingly
     * The output is not useful in production since it has insufficient context and is not queryable
     */
    private _createDevelopmentLoggers(): void {

        // Create the root logger
        const developmentLogConfig = this._logConfiguration.development;
        this._createDevelopmentLogger(ROOT_DEVELOPMENT_LOGGER_NAME, developmentLogConfig.level);

        // Add extra loggers per class if configured
        if (developmentLogConfig.overrideLevels) {
            for (const name in developmentLogConfig.overrideLevels) {
                if (name) {

                    const level = developmentLogConfig.overrideLevels[name];
                    this._createDevelopmentLogger(name, level);
                }
            }
        }
    }

    /*
     * Create a single development logger
     * Development loggers intentionally only support a console logger
     */
    private _createDevelopmentLogger(name: string, level: string): void {

        const transports = [];
        transports.push(new winston.transports.Console());

        // Create the logger
        const options = {
            transports,
            format: this._createDevelopmentFormatter(name),
            level,
        } as winston.LoggerOptions;

        winston.loggers.add(name, options);
    }

    /*
     * A utility method to create the file transport consistently
     */
    private _createFileTransport(transportConfig: any): Transport {

        const options = {
            filename: `${transportConfig.filePrefix}-%DATE%.log`,
            dirname: `${transportConfig.dirname}`,
            datePattern: 'YYYY-MM-DD',
            maxSize: transportConfig.maxSize,
            maxFiles: transportConfig.maxFiles,
        } as DailyRotateFile.DailyRotateFileTransportOptions;

        return new DailyRotateFile(options);
    }

    /*
     * Create the formatter for development text output in a parameterised manner
     */
    private _createDevelopmentFormatter(loggerName: string): any {

        return winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf((info) => `${info.level}: ${info.timestamp} : ${loggerName} : ${info.message}`),
        );
    }
}
