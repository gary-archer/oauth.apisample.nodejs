"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
/*
 * A helper class to ensure that any OAuth trace or error messages are routed to the main window and not the frame
 */
var IFrameWindowHelper = /** @class */ (function () {
    function IFrameWindowHelper() {
    }
    /*
     * Get the main window item
     */
    IFrameWindowHelper.getMainWindowElement = function (itemName) {
        if (IFrameWindowHelper.isIFrameOperation()) {
            return window.parent.$(itemName);
        }
        else {
            return $(itemName);
        }
    };
    /*
     * Detect whether a particular operation is running on the silent renew iframe
     */
    IFrameWindowHelper.isIFrameOperation = function () {
        return (window.parent && window !== window.parent);
    };
    return IFrameWindowHelper;
}());
exports.default = IFrameWindowHelper;
