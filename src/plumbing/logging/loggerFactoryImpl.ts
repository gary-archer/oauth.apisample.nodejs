import winston, {Logform, LoggerOptions} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import Transport from 'winston-transport';
import {LoggingConfiguration} from '../configuration/loggingConfiguration.js';
import {ErrorUtils} from '../errors/errorUtils.js';
import {LogEntryImpl} from './logEntryImpl.js';
import {LoggerFactory} from './loggerFactory.js';

/*
 * The logger factory adapts the logger framework to implement preferred logging
 */
export class LoggerFactoryImpl implements LoggerFactory {

    private apiName: string;
    private performanceThresholdMilliseconds: number;
    private prettyJsonFormatter: Logform.Format;
    private bareJsonFormatter: Logform.Format;

    /*
     * Create the logger factory before reading configuration
     */
    public constructor() {

        this.apiName = '';
        this.performanceThresholdMilliseconds = 1000;

        // Create a pretty JSON formatter for local output of structured logs
        this.prettyJsonFormatter = winston.format.combine(
            winston.format.printf((logData: any) => {
                return JSON.stringify(logData.message, null, 2);
            }));

        // Create a bare JSON formatter with a log entry per line, for log shippers
        this.bareJsonFormatter = winston.format.combine(
            winston.format.printf((logData: any) => {
                return JSON.stringify(logData.message);
            }));

        // Colours for debug logging
        winston.addColors({
            error: 'red',
            warn: 'yellow',
            info: 'white',
            debug: 'blue',
        });
    }

    /*
     * At application startup, create loggers from the configuration file settings
     */
    public configure(configuration: LoggingConfiguration): void {

        this.apiName = configuration.apiName;

        // Create the fixed request logger
        const requestLogConfig = configuration.loggers.find((l: any) => l.type === 'request');
        if (requestLogConfig) {
            this.performanceThresholdMilliseconds = requestLogConfig.performanceThresholdMilliseconds;
            this.createRequestLogger(requestLogConfig);
        }

        // Create the fixed audit logger
        const auditLogConfig = configuration.loggers.find((l: any) => l.type === 'audit');
        if (auditLogConfig) {
            this.createAuditLogger(auditLogConfig);
        }

        // Create othed debug loggers
        const debugLogConfig = configuration.loggers.find((l: any) => l.type === 'debug');
        if (debugLogConfig) {
            this.createDebugLoggers(debugLogConfig);
        }
    }

    /*
     * Special handling for startup errors
     */
    public logStartupError(exception: any): void {

        // Create a default request logger
        if (!winston.loggers.has('request')) {

            const defaultConfig = {
                type: 'request',
                transports: [{
                    type: 'console',
                }],
            };
            this.createRequestLogger(defaultConfig);
        }

        // Get the error into a loggable format
        const error = ErrorUtils.createServerError(exception);

        // Create a log entry and set error details
        const logEntry = new LogEntryImpl(this.apiName, this.performanceThresholdMilliseconds);
        logEntry.setOperationName('startup');
        logEntry.setServerError(error);
        this.getRequestLogger()?.info(logEntry.getRequestLog());
    }

    /*
     * Create a log entry at the start of an API request
     */
    public createLogEntry(): LogEntryImpl {
        return new LogEntryImpl(this.apiName, this.performanceThresholdMilliseconds);
    }

    /*
     * Return the request logger
     */
    public getRequestLogger(): winston.Logger | null {

        if (winston.loggers.has('request')) {
            return winston.loggers.get('request');
        }

        return null;
    }

    /*
     * Return the audit logger
     */
    public getAuditLogger(): winston.Logger | null {

        if (winston.loggers.has('audit')) {
            return winston.loggers.get('audit');
        }

        return null;
    }

    /*
     * Get a named debug logger or default to the root debug logger
     */
    public getDebugLogger(name: string): winston.Logger | null {

        if (winston.loggers.has(name)) {
            return winston.loggers.get(name);
        }

        if (winston.loggers.has('root')) {
            return winston.loggers.get('root');
        }

        return null;
    }

    /*
     * Add an always on request logger for technical support details
     */
    private createRequestLogger(config: any): void {

        const loggerOptions = {
            level: 'info',
            transports: this.getTransports(config.transports),
        } as LoggerOptions;

        winston.loggers.add('request', loggerOptions);
    }

    /*
     * Add an always on audit logger request logger for technical support details
     */
    private createAuditLogger(config: any): void {

        const loggerOptions = {
            level: 'info',
            transports: this.getTransports(config.transports),
        } as LoggerOptions;

        winston.loggers.add('audit', loggerOptions);
    }

    /*
     * Get Winston transports for a logger
     */
    private getTransports(transportsConfig: any): any[] {

        const transports = [];

        // The console transport is used for log shipping in Kubernetes
        const consoleTransportConfig = transportsConfig.find((a: any) => a.type === 'console');
        if (consoleTransportConfig) {
            const consoleTransport = new winston.transports.Console();
            if (consoleTransport) {
                consoleTransport.format =
                    consoleTransportConfig.prettyPrint ? this.prettyJsonFormatter : this.bareJsonFormatter;
                transports.push(consoleTransport);
            }
        }

        // The file transport is used for log shipping from a developer PC
        const fileTransportConfig = transportsConfig.find((a: any) => a.type === 'file');
        if (fileTransportConfig) {
            const fileTransport = this.createFileTransport(fileTransportConfig);
            if (fileTransport) {
                fileTransport.format = this.bareJsonFormatter;
                transports.push(fileTransport);
            }
        }

        return transports;
    }

    /*
     * Create a file transport from configuration settings
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
     * Add debug loggers
     */
    private createDebugLoggers(config: any): void {

        // Create the root logger
        this.createDebugLogger('root', config.level);

        // Add extra loggers per class if configured
        if (config.overrideLevels) {
            for (const name in config.overrideLevels) {
                if (name) {

                    const level = config.overrideLevels[name];
                    this.createDebugLogger(name, level);
                }
            }
        }
    }

    /*
     * Add a single debug logger
     */
    private createDebugLogger(name: string, level: string): void {

        const transports = [];
        transports.push(new winston.transports.Console());

        const options = {
            level,
            transports,
            format: this.createDebugFormatter(name),
        } as LoggerOptions;

        winston.loggers.add(name, options);
    }

    /*
     * Create a formatter for debug messages
     */
    private createDebugFormatter(loggerName: string): any {

        return winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf((info: any) => `${info.level}: ${info.timestamp} : ${loggerName} : ${info.message}`),
        );
    }
}
