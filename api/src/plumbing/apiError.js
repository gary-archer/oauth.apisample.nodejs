'use strict';

/*
 * A simple error class for the API
 */
class ApiError {

    /*
     * Let callers supply a subset of named parameters via object destructuring
     */
    constructor({
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
    
    get message() {
        return this._message;
    }
    
    set message(message) {
        this._message = message;
    }
    
    get statusCode() {
        return this._statusCode;
    }
    
    get area() {
        return this._area;
    }
    
    get url() {
        return this._url;
    }

    get details() {
        return this._details;
    }
    
    set details(details) {
        this._details = details;
    }
}

module.exports = ApiError;