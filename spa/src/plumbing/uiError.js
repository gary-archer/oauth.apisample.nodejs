"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * A simple error class for the UI
 */
var UIError = /** @class */ (function () {
    /*
     * Let callers supply a subset of named parameters via object destructuring
     */
    function UIError(_a) {
        var _b = _a.message, message = _b === void 0 ? '' : _b, _c = _a.statusCode, statusCode = _c === void 0 ? -1 : _c, _d = _a.area, area = _d === void 0 ? '' : _d, _e = _a.url, url = _e === void 0 ? '' : _e, _f = _a.details, details = _f === void 0 ? '' : _f, _g = _a.nonError, nonError = _g === void 0 ? false : _g;
        this._message = message;
        this._statusCode = statusCode;
        this._area = area;
        this._url = url;
        this._details = details;
        this._nonError = nonError;
    }
    Object.defineProperty(UIError.prototype, "message", {
        /*
         * Return properties for display
         */
        get: function () {
            return this._message;
        },
        set: function (message) {
            this._message = message;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIError.prototype, "statusCode", {
        get: function () {
            return this._statusCode;
        },
        set: function (statusCode) {
            this._statusCode = statusCode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIError.prototype, "area", {
        get: function () {
            return this._area;
        },
        set: function (area) {
            this._area = area;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIError.prototype, "url", {
        get: function () {
            return this._url;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIError.prototype, "details", {
        get: function () {
            return this._details;
        },
        set: function (details) {
            this._details = details;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIError.prototype, "nonError", {
        get: function () {
            return this._nonError;
        },
        enumerable: true,
        configurable: true
    });
    return UIError;
}());
exports.default = UIError;
