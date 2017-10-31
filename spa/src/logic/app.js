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
var authenticator_1 = require("../plumbing/authenticator");
var httpClient_1 = require("../plumbing/httpClient");
var oauthLogger_1 = require("../plumbing/oauthLogger");
var errorHandler_1 = require("../plumbing/errorHandler");
var router_1 = require("./router");
var $ = require("jquery");
/*
 * The application class
 */
var App = /** @class */ (function () {
    /*
     * Class setup
     */
    function App() {
        // Initialize Javascript
        window.$ = $;
        this._setupCallbacks();
    }
    /*
     * The entry point for the SPA
     */
    App.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Set up click handlers
                        $('#btnHome').click(this._onHome);
                        $('#btnRefreshData').click(this._onRefreshData);
                        $('#btnExpireAccessToken').click(this._onExpireToken);
                        $('#btnLogout').click(this._onLogout);
                        $('#btnClearError').click(this._onClearError);
                        $('#btnClearTrace').click(this._onClearTrace);
                        // Disable buttons until ready
                        $('.initiallyDisabled').prop('disabled', true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, this._getAppConfig()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._configureAuthentication()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this._handleLoginResponse()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this._getUserClaims()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this._runPage()];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_1 = _a.sent();
                        errorHandler_1.default.reportError(e_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Download application configuration
     */
    App.prototype._getAppConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, httpClient_1.default.loadAppConfiguration('app.config.json')];
                    case 1:
                        _a._appConfig = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Point OIDC logging to our application logger and then supply OAuth settings
     */
    App.prototype._configureAuthentication = function () {
        this._authenticator = new authenticator_1.default(this._appConfig.oauth);
        oauthLogger_1.default.initialize();
        this._router = new router_1.default(this._appConfig, this._authenticator);
    };
    /*
     * Handle login responses on page load so that we have tokens and can call APIs
     */
    App.prototype._handleLoginResponse = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._authenticator.handleLoginResponse()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Download user claims from the API, which can contain any data we like
     */
    App.prototype._getUserClaims = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._router.executeUserInfoView()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Once login startup login processing has completed, start listening for hash changes
     */
    App.prototype._runPage = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        $(window).on('hashchange', this._onHashChange);
                        return [4 /*yield*/, this._router.executeView()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Change the view based on the hash URL and catch errors
     */
    App.prototype._onHashChange = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        oauthLogger_1.default.updateLevelIfRequired();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._router.executeView()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        errorHandler_1.default.reportError(e_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Button handler to reset the hash location to the list view and refresh
     */
    App.prototype._onHome = function () {
        if (location.hash === '#' || location.hash.length === 0) {
            this._onHashChange();
        }
        else {
            location.hash = '#';
        }
    };
    /*
     * Force a page reload
     */
    App.prototype._onRefreshData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._router.executeView()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        errorHandler_1.default.reportError(e_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Force a new access token to be retrieved
     */
    App.prototype._onExpireToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._authenticator.expireAccessToken()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Start a logout request
     */
    App.prototype._onLogout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._authenticator.startLogout()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Clear error output
     */
    App.prototype._onClearError = function () {
        errorHandler_1.default.clear();
    };
    /*
     * Clear trace output
     */
    App.prototype._onClearTrace = function () {
        oauthLogger_1.default.clear();
    };
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    App.prototype._setupCallbacks = function () {
        this._configureAuthentication = this._configureAuthentication.bind(this);
        this._handleLoginResponse = this._handleLoginResponse.bind(this);
        this._getUserClaims = this._getUserClaims.bind(this);
        this._runPage = this._runPage.bind(this);
        this._onHashChange = this._onHashChange.bind(this);
        this._onHome = this._onHome.bind(this);
        this._onRefreshData = this._onRefreshData.bind(this);
        this._onExpireToken = this._onExpireToken.bind(this);
        this._onLogout = this._onLogout.bind(this);
    };
    return App;
}());
/*
 * Start the application
 */
var app = new App();
app.execute();
