/*
 * A simple error class for the API
 */
export default class ApiError {

    /*
     * Fields
     */
    private _message: string;
    private _statusCode: number;
    private _area: string;
    private _url: string;
    private _details: string;

    /*
     * Let callers supply a subset of named parameters via object destructuring
     */
    public constructor({
        message = '',
        statusCode = 500,
        area = '',
        url = '',
        details = ''
    }) {
        this._message = message;
        this._statusCode = statusCode;
        this._area = area;
        this._url = url;
        this._details = details;
    }
    
    public get message(): string {
        return this._message;
    }
    
    public set message(message) {
        this._message = message;
    }
    
    public get statusCode(): number {
        return this._statusCode;
    }
    
    public get area(): string {
        return this._area;
    }

    public set area(area) {
        this._area = area;
    }
    
    public get url(): string {
        return this._url;
    }

    public get details(): string {
        return this._details;
    }
    
    public set details(details) {
        this._details = details;
    }
}