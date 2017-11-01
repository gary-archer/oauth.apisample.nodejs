import * as winston from 'winston';

/*
 * Configure colours
 */
winston.addColors({
    info: 'white',
    warn: 'yellow',
    error: 'red' 
});

/*
 * Create the logger
 */
const logger = new winston.Logger();

/*
 * A class to handle validating tokens received by the API
 */
export default class ApiLogger {
    
    /*
     * Initialize the logger
     */
    public static initialize(): void {
        
        logger.add(winston.transports.Console, {
          level: 'info',
          colorize: true
        });
    }
    
    /*
     * Log info level
     */
    public static info(...args): void {
        logger.info(ApiLogger._getText(arguments));
    }
    
    /*
     * Log warn level
     */
    public static warn(...args) {
        logger.warn(ApiLogger._getText(arguments));
    }
    
    /*
     * Log error level
     */
    public static error(...args): void {
        logger.error(ApiLogger._getText(arguments));
    }
    
    /*
     * Get the text to output
     */
    private static _getText(args: any): string {
        let text = Array.prototype.slice.call(args).join(' : ');
        return text;
    }
}