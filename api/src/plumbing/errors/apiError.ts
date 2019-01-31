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
    private _area: string;
    private _instanceId: number;
    private _url: string;
    private _time: string;
    private _details: string;

    /*
     * Construct from input
     */
    public constructor(area: string, message: string) {

        super(message);
        this._area = area;

        // Default other fields
        this._statusCode = 500,
        this._instanceId = Math.floor(Math.random() * (MAX_ERROR_ID - MIN_ERROR_ID + 1) + MIN_ERROR_ID),
        this._url = '',
        this._time = new Date().toUTCString(),
        this._details = '';

        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public get statusCode(): number {
        return this._statusCode;
    }

    public get area(): string {
        return this._area;
    }

    public set area(area: string) {
        this._area = area;
    }

    public get instanceId(): number {
        return this._instanceId;
    }

    public get url(): string {
        return this._url;
    }

    public set url(url: string) {
        this._url = url;
    }

    public get time(): string {
        return this._time;
    }

    public get details(): string {
        return this._details;
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
            message: this.message,
            area: this.area,
            instanceId: this._instanceId,
            time: this._time,
            url: this._url,
            details: this.details,
            stackTrace: this.stack,
        };
    }

    /*
     * Translate to a confidential error that is returned to the API caller, with a reference to the logged details
     */
    public toClientError(): ClientError {

        const error = new ClientError(this._statusCode, this._area, this.message);
        error.id = this._instanceId;
        return error;
    }
}
