import {LoggerFactory} from './loggerFactory.js';
import {LoggerFactoryImpl} from './loggerFactoryImpl.js';

/*
 * A simple builder class to expose a segregated interface
 */
export class LoggerFactoryBuilder {

    public static create(): LoggerFactory {
        return new LoggerFactoryImpl();
    }
}
