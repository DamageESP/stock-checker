"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
exports.__esModule = true;
exports.sendNotification = exports.timeStamp = void 0;
var config_1 = require("./config");
var node_fetch_1 = require("node-fetch");
// https://gist.github.com/hurjas/2660489
function timeStamp() {
    // Create a date object with the current time
    var now = new Date();
    // Create an array with the current month, day and time
    var date = [now.getDate(), now.getMonth() + 1, now.getFullYear()];
    // Create an array with the current hour, minute and second
    var time = [now.getHours().toString(), now.getMinutes().toString(), now.getSeconds().toString()];
    // Determine AM or PM suffix based on the hour
    var suffix = (parseInt(time[0]) < 12) ? 'AM' : 'PM';
    // Convert hour from military time
    time[0] = (parseInt(time[0]) < 12) ? time[0] : (parseInt(time[0]) - 12).toString();
    // If hour is 0, set it to 12
    time[0] = time[0] || '12';
    // If seconds and minutes are less than 10, add a zero
    for (var i = 1; i < 3; i++) {
        if (parseInt(time[i]) < 10) {
            time[i] = '0' + time[i];
        }
    }
    // Return the formatted string
    return date.join('/') + ' ' + time.join(':') + ' ' + suffix;
}
exports.timeStamp = timeStamp;
function sendNotification(productData) {
    return __awaiter(this, void 0, void 0, function () {
        var formData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(config_1["default"] === null || config_1["default"] === void 0 ? void 0 : config_1["default"].app_key))
                        throw new Error('No Pushed configuration available');
                    formData = new FormData();
                    formData.append('app_key', config_1["default"].app_key);
                    formData.append('app_secret', config_1["default"].app_secret);
                    formData.append('target_type', 'app');
                    formData.append('content', "Hay stock de ".concat(productData.name, " en @").concat(productData.site));
                    formData.append('content_type', 'url');
                    formData.append('content_extra', productData.site);
                    return [4 /*yield*/, (0, node_fetch_1["default"])('https://api.pushed.co/1/push', {
                            method: 'POST',
                            body: formData
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.sendNotification = sendNotification;
