"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var errorHandler_1 = require("./errorHandler");
var uiError_1 = require("./uiError");
var $ = require("jquery");
/*
 * Logic related to making HTTP calls
 */
var HttpClient = /** @class */ (function () {
    function HttpClient() {
    }
    /*
     * Download JSON data from the app config file
     */
    HttpClient.loadAppConfiguration = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var xhr_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, $.ajax({
                                url: filePath,
                                type: 'GET',
                                dataType: 'json'
                            })];
                    case 1: 
                    // Make the call
                    return [2 /*return*/, _a.sent()];
                    case 2:
                        xhr_1 = _a.sent();
                        // Improve the default error message
                        throw errorHandler_1.default.getFromAjaxError(xhr_1, filePath);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Get data from an API URL and handle retries if needed
     */
    HttpClient.callApi = function (url, method, dataToSend, authenticator) {
        return __awaiter(this, void 0, void 0, function () {
            var token, xhr_2, token_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, authenticator.getAccessToken()];
                    case 1:
                        token = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 9]);
                        return [4 /*yield*/, HttpClient._callApiWithToken(url, method, dataToSend, authenticator, token)];
                    case 3: 
                    // Call the API
                    return [2 /*return*/, _a.sent()];
                    case 4:
                        xhr_2 = _a.sent();
                        // Non 401 errors are already handled so rethrow them
                        if (xhr_2 instanceof uiError_1.default) {
                            throw xhr_2;
                        }
                        if (!(xhr_2.status === 401)) return [3 /*break*/, 8];
                        // Clear the failing access token from storage and get a new one
                        return [4 /*yield*/, authenticator.clearAccessToken()];
                    case 5:
                        // Clear the failing access token from storage and get a new one
                        _a.sent();
                        return [4 /*yield*/, authenticator.getAccessToken()];
                    case 6:
                        token_1 = _a.sent();
                        return [4 /*yield*/, HttpClient._callApiWithToken(url, method, dataToSend, authenticator, token_1)];
                    case 7: 
                    // Call the API again
                    return [2 /*return*/, _a.sent()];
                    case 8: return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Do the work of calling the API
     */
    HttpClient._callApiWithToken = function (url, method, dataToSend, authenticator, accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var dataToSendText, xhr_3, ajaxError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataToSendText = JSON.stringify(dataToSend | {});
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, $.ajax({
                                url: url,
                                data: dataToSendText,
                                dataType: 'json',
                                contentType: 'application/json',
                                type: method,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                                }
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        xhr_3 = _a.sent();
                        // Rethrow 401s to the caller
                        if (xhr_3.status === 401) {
                            throw xhr_3;
                        }
                        ajaxError = errorHandler_1.default.getFromAjaxError(xhr_3, url);
                        throw ajaxError;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return HttpClient;
}());
exports.default = HttpClient;
