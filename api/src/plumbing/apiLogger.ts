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
    public static info(...args:any[]): void {
        logger.info(ApiLogger._getText(args));
    }
    
    /*
     * Log warn level
     */
    public static warn(...args:any[]): void {
        logger.warn(ApiLogger._getText(args));
    }
    
    /*
     * Log error level
     */
    public static error(...args:any[]): void {
        logger.error(ApiLogger._getText(args));
    }
    
    /*
     * Get the text to output
     */
    private static _getText(args: any): string {
        let text = Array.prototype.slice.call(args).join(' : ');
        return text;
    }
}