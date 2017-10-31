/*
 * A simple error class for the UI
 */
export default class UIError {

    /*
     * Fields
     */
    private _message: string;
    private _statusCode: number;
    private _area: string;
    private _url: string;
    private _details: string;
    private _nonError: boolean;

    /*
     * Let callers supply a subset of named parameters via object destructuring
     */
    public constructor({
        message = '',
        statusCode = -1,
        area = '',
        url = '',
        details = '',
        nonError = false
    }) {
        this._message = message;
        this._statusCode = statusCode;
        this._area = area;
        this._url = url;
        this._details = details;
        this._nonError = nonError;
    }
    
    /*
     * Return properties for display
     */
    public get message():string {
        return this._message;
    }
    
    public set message(message) {
        this._message = message;
    }
    
    public get statusCode():number {
        return this._statusCode;
    }
    
    public set statusCode(statusCode) {
        this._statusCode = statusCode;
    }
    
    public get area():string {
        return this._area;
    }
    
    public set area(area) {
        this._area = area;
    }

    public get url():string {
        return this._url;
    }

    public get details():string {
        return this._details;
    }
    
    public set details(details) {
        this._details = details;
    }
    
    public get nonError():boolean {
        return this._nonError;
    }
}