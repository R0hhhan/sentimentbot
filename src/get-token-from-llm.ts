import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENAI_KEY
})
  
//qwen/qwen2.5-32b-instruct ->2549
//openai/gpt-4o-mini ->2757
//google/gemini-flash-1.5-8b ->2653
//google/gemini-2.0-flash-lite-001 ->2865
//google/gemini-2.0-flash-001 ->3063
//google/gemini-2.0-flash-exp:free 
//google/gemini-flash-1.5 ->1672 ->> cheapest
//anthropic/claude-3.7-sonnet 

export async function getTokenFromLLM(contents: string): Promise<string> {
    const completion = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-001",
        store: false,
        messages: [
            {
                "role": "system",
                "content": 
                `You are an expert in analyzing news related to the Indian stock market.
                Your task is to extract the NSE-listed stock ticker that will benefit the most from the given news.  
                If the news is positive and clearly favors a specific company, return its NSE ticker symbol.  
                If the news is negative, neutral, or does not indicate a clear beneficiary, return "NULL".  
                Output should be a single word: either the NSE ticker or "NULL".`
            },
            { "role": "user", "content": contents }
        ]
    });
    return completion.choices[0].message.content ?? "NULL";
}