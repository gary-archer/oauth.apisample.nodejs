import {Disposable} from '../utilities/disposable';
import {LogEntryImpl} from './logEntryImpl';

/*
 * A helper to support the dispose pattern for child operations
 */
export class ChildLogEntry implements Disposable {

    private readonly _logEntry: LogEntryImpl;

    public constructor(logEntry: LogEntryImpl) {
        this._logEntry = logEntry;
    }

    public dispose(): void {
        this._logEntry.endChildOperation();
    }
}
