/*
 * A range for random error ids
 */
import {ClientError} from './clientError';
const MIN_ERROR_ID = 10000;
const MAX_ERROR_ID = 99999;

/*
 * An error entity that the API will log
 */
export class ApiError extends Error {

    /*
     * Error properties to log
     */
    private _statusCode: number;
    private _errorCode: string;
    private _area: string;
    private _instanceId: number;
    private _utcTime: string;
    private _details: string;

    /*
     * Errors are categorized by error code
     */
    public constructor(errorCode: string, userMessage: string) {

        super(userMessage);

        this._statusCode = 500;
        this._errorCode = errorCode;
        this._area = 'BasicApi';
        this._instanceId = Math.floor(Math.random() * (MAX_ERROR_ID - MIN_ERROR_ID + 1) + MIN_ERROR_ID),
        this._utcTime = new Date().toISOString(),
        this._details = '';

        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public set details(details: string) {
        this._details = details;
    }

    /*
     * Return an object ready to log, including the stack trace
     */
    public toLogFormat(): any {

        return {
            statusCode: this._statusCode,
            clientError: this.toClientError().toResponseFormat(),
            serviceError: {
                errorCode: this._errorCode,
                details: this._details,
                stackTrace: this.stack,
            },
        };
    }

    /*
     * Translate to a confidential and supportable error response to return to the API caller
     */
    public toClientError(): ClientError {

        // Set a generic client error code for the server exception
        const error = new ClientError(this._statusCode, 'internal_server_error', this.message);

        // Also indicate which part of the system, where in logs and when the error occurred
        error.setExceptionDetails(this._area, this._instanceId, this._utcTime);
        return error;
    }
}
