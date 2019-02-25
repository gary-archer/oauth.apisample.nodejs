import {IClientError} from './iclientError';

/*
 * Manage errors due to invalid client usage
 */
export class ClientError extends Error implements IClientError {

    /*
     * Mandatory fields for both 4xx and 500 errors
     */
    private _statusCode: number;
    private _errorCode: string;

    /*
     * Extra fields for 500 errors
     */
    private _area: string;
    private _id: number;
    private _utcTime: string;

    /*
     * Construct from mandatory fields
     */
    public constructor(statusCode: number, errorCode: string, message: string) {

        // Set mandatory fields
        super(message);
        this._statusCode = statusCode;
        this._errorCode = errorCode;

        // Initialise 5xx fields
        this._area = '';
        this._id = 0;
        this._utcTime = '';

        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public getStatusCode(): number {
        return this._statusCode;
    }

    /*
     * Set extra fields to return to the caller for 500 errors
     */
    public setExceptionDetails(area: string, id: number, utcTime: string) {
        this._area = area;
        this._id = id;
        this._utcTime = utcTime;
    }

    /*
     * Return an object that can be serialized by calling JSON.stringify
     */
    public toResponseFormat(): any {

        const body: any = {
            code: this._errorCode,
            message: this.message,
        };

        if (this._id > 0 && this._area.length > 0 && this._utcTime.length > 0) {
            body.id = this._id;
            body.area = this._area;
            body.utcTime = this._utcTime;
        }

        return body;
    }

    /*
     * Similar to the above but includes the status code
     */
    public toLogFormat(): any {

        return {
            status: this._statusCode,
            body: this.toResponseFormat(),
        };
    }
}
