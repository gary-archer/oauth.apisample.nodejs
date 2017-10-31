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
var httpClient_1 = require("../plumbing/httpClient");
var $ = require("jquery");
/*
 * Logic related to the list view
 */
var DetailsView = /** @class */ (function () {
    /*
     * Class setup
     */
    function DetailsView(authenticator, baseUrl, id) {
        this._authenticator = authenticator;
        this._baseUrl = baseUrl;
        this._id = id;
        this._setupCallbacks();
    }
    /*
     * Run the view
     */
    DetailsView.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, data, uiError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Set UI content while loading
                        $('#detailsContainer').removeClass('hide');
                        $('#detailsContainer').text('Calling API to get golfer details ...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        url = this._baseUrl + "/golfers/" + this._id;
                        return [4 /*yield*/, httpClient_1.default.callApi(url, 'GET', null, this._authenticator)];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, this._renderData(data)];
                    case 3:
                        uiError_1 = _a.sent();
                        // If an invalid id is typed in the browser then return to the list page
                        if (uiError_1.statusCode === 404) {
                            location.hash = '#';
                            return [2 /*return*/, Promise.resolve()];
                        }
                        throw uiError_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Hide UI elements when the view unloads
     */
    DetailsView.prototype.unload = function () {
        $('#detailsContainer').addClass('hide');
    };
    /*
     * Render data
     */
    DetailsView.prototype._renderData = function (golfer) {
        // Clear loading content
        $('#detailsContainer').text('');
        // Set button state
        $('.initiallyDisabled').prop('disabled', false);
        $('.initiallyDisabled').removeClass('disabled');
        // Use the full size image
        var golferImage = $("<a>\n                               <img src='images/" + golfer.name + ".png' class='img-responsive'>\n                             </a>");
        // Render summary details
        var golferDiv = $("<div class='col-xs-6'>\n                             <div>Name : <b>" + golfer.name + "</b></div>\n                             <div>Tour Wins : <b>" + golfer.tour_wins + "</b></div>\n                           </div>");
        golferDiv.append(golferImage);
        $('#detailsContainer').append(golferDiv);
        // Render the tour wins container
        var tourWinsDiv = $("<div class='col-xs-6'>\n                               <div><b>All Tour Wins</b></div>\n                               <ul id='wins_list'></ul>\n                             </div>");
        $('#detailsContainer').append(tourWinsDiv);
        // Render individual win details
        golfer.wins.forEach(function (win) {
            var info = win.year + " : " + win.eventName;
            $('#wins_list').append($('<li>').html(info));
        });
        return Promise.resolve();
    };
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    DetailsView.prototype._setupCallbacks = function () {
        this._renderData = this._renderData.bind(this);
    };
    return DetailsView;
}());
exports.default = DetailsView;
