"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fyers = exports.fyersModel = void 0;
exports.authenticate = authenticate;
async function get_auth() {
    let auth = -1;
    let cnt = 0;
    while (auth === -1 && cnt <= 100) {
        const res = await (await fetch("https://redirect-kappa-lemon.vercel.app/back/")).json();
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
}
exports.fyersModel = require("fyers-api-v3").fyersModel;
exports.fyers = new exports.fyersModel();
async function authenticate() {
    exports.fyers.setAppId(process.env.CLIENT_ID);
    exports.fyers.setRedirectUrl("https://redirect-kappa-lemon.vercel.app/");
    const URLx = exports.fyers.generateAuthCode();
    console.log(URLx);
    const auth = await get_auth();
    const response = await exports.fyers.generate_access_token({ "client_id": process.env.CLIENT_ID, "secret_key": process.env.SECRET_KEY, "auth_code": auth });
    if (response.s === 'ok') {
        exports.fyers.setAccessToken(response.access_token);
        console.log("were are active");
    }
    else {
        console.log("error generating access token", response);
    }
}
