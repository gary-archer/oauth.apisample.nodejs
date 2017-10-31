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
var Oidc = require("oidc-client");
/*
 * The entry point for initiating login and token requests
 */
var Authenticator = /** @class */ (function () {
    /*
     * Class setup
     */
    function Authenticator(config) {
        // Create OIDC settings from our application configuration
        var settings = {
            authority: config.authority,
            client_id: config.client_id,
            redirect_uri: config.app_uri,
            silent_redirect_uri: config.app_uri,
            post_logout_redirect_uri: "" + config.app_uri + config.post_logout_path,
            scope: config.scope,
            response_type: 'token id_token',
            loadUserInfo: true,
            automaticSilentRenew: true,
            monitorSession: false
        };
        // Create the user manager
        this._userManager = new Oidc.UserManager(settings);
        this._userManager.events.addSilentRenewError(this._onSilentTokenRenewalError);
        this._setupCallbacks();
    }
    /*
     * Clear the current access token from storage to force a login
     */
    Authenticator.prototype.clearAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._userManager.getUser()];
                    case 1:
                        user = _a.sent();
                        if (user) {
                            user.access_token = null;
                            this._userManager.storeUser(user);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Make the current access token in storage act like it has expired
     */
    Authenticator.prototype.expireAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._userManager.getUser()];
                    case 1:
                        user = _a.sent();
                        if (user) {
                            // Set the stored value to expired and also corrupt the token so that there is a 401 if it is sent to an API
                            user.expires_at = Date.now() / 1000 + 30;
                            user.access_token = 'x' + user.access_token + 'x';
                            // Update OIDC so that it silently renews the token almost immediately
                            this._userManager.storeUser(user);
                            this._userManager.stopSilentRenew();
                            this._userManager.startSilentRenew();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Get Open Id Connect claims
     */
    Authenticator.prototype.getOpenIdConnectUserClaims = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._userManager.getUser()];
                    case 1:
                        user = _a.sent();
                        if (user && user.profile) {
                            return [2 /*return*/, user.profile];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    /*
     * Get an access token and login if required
     */
    Authenticator.prototype.getAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user, data, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._userManager.getUser()];
                    case 1:
                        user = _a.sent();
                        if (user && user.access_token) {
                            return [2 /*return*/, user.access_token];
                        }
                        data = {
                            hash: location.hash.length > 0 ? location.hash : '#'
                        };
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        // Start a login redirect
                        return [4 /*yield*/, this._userManager.signinRedirect({ state: JSON.stringify(data) })];
                    case 3:
                        // Start a login redirect
                        _a.sent();
                        // Short circuit SPA page execution
                        throw errorHandler_1.default.getNonError();
                    case 4:
                        e_1 = _a.sent();
                        // Handle OAuth specific errors, such as those calling the metadata endpoint
                        throw errorHandler_1.default.getFromOAuthRequest(e_1);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Handle the response from the authorization server
     */
    Authenticator.prototype.handleLoginResponse = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user, data, e_2, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // See if there is anything to do
                        if (location.hash.indexOf('state') === -1) {
                            return [2 /*return*/, Promise.resolve()];
                        }
                        if (!(window.top === window.self)) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._userManager.signinRedirectCallback()];
                    case 2:
                        user = _a.sent();
                        data = JSON.parse(user.state);
                        location.replace(location.pathname + data.hash);
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        // Handle OAuth response errors
                        throw errorHandler_1.default.getFromOAuthResponse(e_2);
                    case 4: return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this._userManager.signinSilentCallback()];
                    case 6:
                        user = _a.sent();
                        // Short circuit SPA page execution
                        throw errorHandler_1.default.getNonError();
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Redirect in order to log out at the authorization server and remove vendor cookies
     */
    Authenticator.prototype.startLogout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._userManager.signoutRedirect()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        errorHandler_1.default.reportError(errorHandler_1.default.getFromOAuthRequest(e_3));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Report any silent token renewal errors
     */
    Authenticator.prototype._onSilentTokenRenewalError = function (e) {
        // Login required is not a real error - we will just redirect the user to login when the API returns 401
        if (e.error !== 'login_required') {
            var error = errorHandler_1.default.getFromOAuthResponse(e);
            errorHandler_1.default.reportError(error);
        }
    };
    /*
* Plumbing to ensure that the this parameter is available in async callbacks
*/
    Authenticator.prototype._setupCallbacks = function () {
        this.clearAccessToken = this.clearAccessToken.bind(this);
        this.getAccessToken = this.getAccessToken.bind(this);
        this._onSilentTokenRenewalError = this._onSilentTokenRenewalError.bind(this);
    };
    return Authenticator;
}());
exports.default = Authenticator;
