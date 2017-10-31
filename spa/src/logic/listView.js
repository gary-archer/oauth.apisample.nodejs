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
var ListView = /** @class */ (function () {
    /*
     * Class setup
     */
    function ListView(authenticator, baseUrl) {
        this._authenticator = authenticator;
        this._baseUrl = baseUrl;
        this._setupCallbacks();
    }
    /*
     * Run the view
     */
    ListView.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Set UI content while loading
                        $('#listContainer').removeClass('hide');
                        $('#listContainer').text('Calling API to get golfers list ...');
                        return [4 /*yield*/, httpClient_1.default.callApi(this._baseUrl + "/golfers", 'GET', null, this._authenticator)];
                    case 1:
                        data = _a.sent();
                        this._renderData(data);
                        return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Hide UI elements when the view unloads
     */
    ListView.prototype.unload = function () {
        $('#listContainer').addClass('hide');
    };
    /*
     * Render data
     */
    ListView.prototype._renderData = function (data) {
        // Clear loading content
        $('#listContainer').text('');
        // Set button state
        $('.initiallyDisabled').prop('disabled', false);
        $('.initiallyDisabled').removeClass('disabled');
        data.golfers.forEach(function (golfer) {
            // Set up the image and a click handler
            var golferLink = $("<a href='#' class='img-thumbnail'>\n                                  <img class='golferImage' src='images/" + golfer.name + "_tn.png' class='img-responsive' data-id='" + golfer.id + "'>\n                                </a>");
            // Set text properties
            var golferDiv = $("<div class='col-xs-3'>\n                                 <div>Name : <b>" + golfer.name + "</b></div>\n                                 <div>Tour Wins : <b>" + golfer.tour_wins + "</b></div>\n                               </div>");
            // Update the DOM
            golferDiv.append(golferLink);
            $('#listContainer').append(golferDiv);
        });
        // Add event handlers for image clicks
        $('.golferImage').on('click', this._selectGolferDetails);
        return Promise.resolve();
    };
    /*
     * When a thumbnail is clicked we will request details data and then update the view
     */
    ListView.prototype._selectGolferDetails = function (e) {
        var golferId = $(e.target).attr('data-id');
        location.hash = "#golfer=" + golferId;
        e.preventDefault();
    };
    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    ListView.prototype._setupCallbacks = function () {
        this._renderData = this._renderData.bind(this);
        this._selectGolferDetails = this._selectGolferDetails.bind(this);
    };
    return ListView;
}());
exports.default = ListView;
