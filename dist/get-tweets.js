"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTweets = getTweets;
const axios_1 = __importDefault(require("axios"));
const TWEET_MAX_TIME_MS = 100 * 60 * 1000;
function extractTweetText(tweetResult) {
    if (!tweetResult || typeof tweetResult !== "object")
        return "";
    if (tweetResult.legacy?.full_text)
        return tweetResult.legacy.full_text;
    if (tweetResult.note_tweet?.note_tweet?.text)
        return tweetResult.note_tweet.note_tweet.text;
    if (tweetResult.quoted_status_result?.legacy?.full_text)
        return tweetResult.quoted_status_result.legacy.full_text;
    if (tweetResult.retweeted_status_result?.legacy?.full_text)
        return tweetResult.retweeted_status_result.legacy.full_text;
    if (tweetResult.core?.user_result?.result?.legacy?.description)
        return tweetResult.core.user_result.result.legacy.description;
    return "";
}
async function fetchTweetsForUser(handle) {
    try {
        const response = await axios_1.default.get(`https://twttrapi.p.rapidapi.com/user-tweets?username=${handle}`, {
            headers: {
                "x-rapidapi-host": "twttrapi.p.rapidapi.com",
                "x-rapidapi-key": process.env.RAPID_API_KEY,
            },
        });
        const timelineInstructions = response.data?.data?.user_result?.result?.timeline_response?.timeline?.instructions;
        if (!timelineInstructions) {
            console.log(`No timeline data found for ${handle}`);
            return [];
        }
        const timelineEntries = timelineInstructions
            .filter((x) => x.__typename === "TimelineAddEntries")
            .flatMap((x) => x.entries || []);
        return timelineEntries
            .map((entry) => {
            try {
                return {
                    contents: extractTweetText(entry?.content?.content?.tweetResult?.result),
                    createdAt: entry?.content?.content?.tweetResult?.result?.legacy?.created_at,
                    user_handle: handle,
                };
            }
            catch (e) {
                console.error(`Error extracting tweet text for ${handle}`, e);
                return null;
            }
        })
            .filter((tweet) => tweet !== null && new Date(tweet.createdAt).getTime() > Date.now() - TWEET_MAX_TIME_MS);
    }
    catch (error) {
        console.error(`Error fetching tweets for ${handle}:`, error);
        return [];
    }
}
async function getTweets(handles) {
    const tweetPromises = handles.map(fetchTweetsForUser);
    const results = await Promise.allSettled(tweetPromises);
    return results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
}
