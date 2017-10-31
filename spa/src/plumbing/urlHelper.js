"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * URL utilities
 */
var UrlHelper = /** @class */ (function () {
    function UrlHelper() {
    }
    /*
     * Parse the hash fragment into an object
     */
    UrlHelper.getLocationHashData = function () {
        var params = {};
        var idx = location.hash.indexOf('#');
        if (idx !== -1) {
            var hashParams = location.hash.slice(idx + 1).split('&');
            hashParams.map(function (hash) {
                var _a = hash.split('='), key = _a[0], val = _a[1];
                params[key] = decodeURIComponent(val);
            });
        }
        return params;
    };
    return UrlHelper;
}());
exports.default = UrlHelper;
