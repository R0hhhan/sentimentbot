require("dotenv").config();
import { authenticate, fyers } from "./authenticate";
import { getTokenFromLLM } from "./get-token-from-llm";
import { getTweets } from "./get-tweets";

async function processTweet(twt: any, mp: Map<string, boolean>) {
    try {
        const tkn = (await getTokenFromLLM(twt.contents)).trim();

        if (tkn.toLowerCase() === "null" || mp.has(tkn)) return;

        console.log(twt);
        console.log(tkn);

        mp.set(tkn, true);
        const reqBody = {
            symbol: `NSE:${tkn}-EQ`,
            qty: 1,
            type: 2,
            side: 1,
            productType: "INTRADAY",
            limitPrice: 0,
            stopPrice: 0,
            validity: "DAY",
            stopLoss: 0,
            takeProfit: 0,
            offlineOrder: false,
            disclosedQty: 0
        };

        console.log(reqBody.symbol);

        await fyers.place_order(reqBody)
            .then((response: any) => console.log(response))
            .catch((error: any) => console.error("Order placement error:", error));

    } catch (error) {
        console.error("Error processing tweet:", error);
    }
}

async function main() {
    await authenticate();
    const handles = ["livemint", "CNBCTV18Live", "moneycontrolcom", "EconomicTimes","FinancialXpress","mystockedge"];
    let mp = new Map();

    setInterval(() => {
        mp = new Map();
    },60 * 60 * 1000);
    setInterval(async () => {
        console.log("Getting tweets...");
        const twts = await getTweets(handles);
        console.log(`Got ${twts.length} tweets.`);

        if (twts.length === 0) return;

        await Promise.allSettled(twts.map(twt => processTweet(twt, mp)));
    }, 15 * 1000);
}

main();
