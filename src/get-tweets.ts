import axios from "axios";

const TWEET_MAX_TIME_MS = 100 * 60 * 1000;

interface Tweet {
    contents: string;
    createdAt: string;
    user_handle: string;
}

function extractTweetText(tweetResult: any): string {
    if (!tweetResult || typeof tweetResult !== "object") return "";

    if (tweetResult.legacy?.full_text) return tweetResult.legacy.full_text;
    if (tweetResult.note_tweet?.note_tweet?.text) return tweetResult.note_tweet.note_tweet.text;
    if (tweetResult.quoted_status_result?.legacy?.full_text) return tweetResult.quoted_status_result.legacy.full_text;
    if (tweetResult.retweeted_status_result?.legacy?.full_text) return tweetResult.retweeted_status_result.legacy.full_text;
    if (tweetResult.core?.user_result?.result?.legacy?.description) return tweetResult.core.user_result.result.legacy.description;

    return "";
}

async function fetchTweetsForUser(handle: string): Promise<Tweet[]> {
    try {
        const response = await axios.get(`https://twttrapi.p.rapidapi.com/user-tweets?username=${handle}`, {
            headers: {
                "x-rapidapi-host": "twttrapi.p.rapidapi.com",
                "x-rapidapi-key": process.env.RAPID_API_KEY!,
            },
        });

        const timelineInstructions = response.data?.data?.user_result?.result?.timeline_response?.timeline?.instructions;
        if (!timelineInstructions) {
            console.log(`No timeline data found for ${handle}`);
            return [];
        }

        const timelineEntries = timelineInstructions
            .filter((x: any) => x.__typename === "TimelineAddEntries")
            .flatMap((x: any) => x.entries || []);

        return timelineEntries
            .map((entry: any) => {
                try {
                    return {
                        contents: extractTweetText(entry?.content?.content?.tweetResult?.result),
                        createdAt: entry?.content?.content?.tweetResult?.result?.legacy?.created_at,
                        user_handle: handle,
                    };
                } catch (e) {
                    console.error(`Error extracting tweet text for ${handle}`, e);
                    return null;
                }
            })
            .filter((tweet: { createdAt: string | number | Date; } | null): tweet is Tweet => tweet !== null && new Date(tweet.createdAt).getTime() > Date.now() - TWEET_MAX_TIME_MS);
    } catch (error) {
        console.error(`Error fetching tweets for ${handle}:`, error);
        return [];
    }
}

export async function getTweets(handles: string[]): Promise<Tweet[]> {
    const tweetPromises = handles.map(fetchTweetsForUser);
    const results = await Promise.allSettled(tweetPromises);

    return results.flatMap((result: PromiseSettledResult<Tweet[]>) => 
        result.status === "fulfilled" ? result.value : []
    );
}
