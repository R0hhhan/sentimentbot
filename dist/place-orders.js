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
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeOrders = placeOrders;
function get_auth() {
    return __awaiter(this, void 0, void 0, function* () {
        let auth = -1;
        let cnt = 0;
        while (auth === -1 && cnt <= 100) {
            const res = yield (yield fetch("https://redirect-kappa-lemon.vercel.app/back/")).json();
            auth = res.auth;
            if (auth !== -1) {
                break;
            }
            const start_time = Date.now();
            while (Date.now() - start_time < 1000) {
                // wait for 1 sec
            }
            cnt++;
        }
        if (cnt > 100) {
            console.log("Failed to get auth, time reached 100sec");
        }
        return auth;
    });
}
function placeOrders() {
    return __awaiter(this, void 0, void 0, function* () {
        const fyersModel = require("fyers-api-v3").fyersModel;
        const fyers = new fyersModel();
        fyers.setAppId("DB1X5WHUCX-100");
        fyers.setRedirectUrl("https://redirect-kappa-lemon.vercel.app/");
        const URLx = fyers.generateAuthCode();
        console.log(URLx);
        const auth = yield get_auth();
        const response = yield fyers.generate_access_token({ "client_id": "DB1X5WHUCX-100", "secret_key": "XVH1KLMJQH", "auth_code": auth });
        if (response.s === 'ok') {
            fyers.setAccessToken(response.access_token);
        }
        else {
            console.log("error generating access token", response);
        }
        fyers.get_profile().then((response) => {
            console.log(response);
        }).catch((err) => {
            console.log(err);
        });
        fyers.getQuotes(["NSE:SBIN-EQ", "NSE:TCS-EQ"]).then((response) => {
            console.log(response);
        }).catch((err) => {
            console.log(err);
        });
        fyers.getMarketDepth({ "symbol": ["NSE:SBIN-EQ", "NSE:TCS-EQ"], "ohlcv_flag": 1 }).then((response) => {
            console.log(response);
        }).catch((err) => {
            console.log(err);
        });
    });
}
