'use strict';

/*
 * A simple error class for the UI
 */
export default class UIError {

    /*
     * Fields
     */
    _message: string;
    _statusCode: number;
    _area: string;
    _url: string;
    _details: string;
    _nonError: boolean;

    /*
     * Let callers supply a subset of named parameters via object destructuring
     */
    constructor({
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
    get message():string {
        return this._message;
    }
    
    set message(message) {
        this._message = message;
    }
    
    get statusCode():number {
        return this._statusCode;
    }
    
    set statusCode(statusCode) {
        this._statusCode = statusCode;
    }
    
    get area():string {
        return this._area;
    }
    
    set area(area) {
        this._area = area;
    }

    get url():string {
        return this._url;
    }

    get details():string {
        return this._details;
    }
    
    set details(details) {
        this._details = details;
    }
    
    get nonError():boolean {
        return this._nonError;
    }
}