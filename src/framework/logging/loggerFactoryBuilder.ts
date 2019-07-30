import {ILoggerFactory} from './iloggerFactory';
import {LoggerFactory} from './loggerFactory';

/*
 * A simple builder class to expose a segregated interface
 */
export class LoggerFactoryBuilder {

    public static Create(): ILoggerFactory {
        return new LoggerFactory();
    }
}
