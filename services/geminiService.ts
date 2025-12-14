
import { GoogleGenAI, Modality } from "@google/genai";
import { ChatMessage, NewsItem, TrendAnalysis } from '../types';

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API_KEY not found in environment variables");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

// Helper to robustly parse JSON from AI responses
const parseAIResponse = (text: string | undefined): any => {
    if (!text) return null;

    // 1. Remove Markdown code blocks
    let clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    // 2. Try direct parse
    try {
        return JSON.parse(clean);
    } catch (e) {
        // 3. Fallback: Extract JSON object or array using regex
        const jsonMatch = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e2) {
                console.error("Regex JSON extraction failed:", e2);
            }
        }
        
        console.error("Failed to parse AI JSON. Raw text preview:", text.substring(0, 50) + "...");
        return null;
    }
};

export const generateSummary = async (text: string, lang: 'en' | 'ar'): Promise<string> => {
    const ai = getClient();
    if (!ai) return "AI Service Unavailable (Missing Key)";

    try {
        const prompt = lang === 'ar' 
        ? `لخّص النص التقني التالي في 3 نقاط رئيسية باللغة العربية:\n\n${text}`
        : `Summarize the following tech content into 3 concise bullet points:\n\n${text}`;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest', // Updated model
            contents: prompt,
        });

        return response.text || "Could not generate summary.";
    } catch (error: any) {
        console.error("Gemini Summary Error:", error);
        if (error?.status === 429 || error?.code === 429) {
            return "Limit Reached. Please try again in a few minutes.";
        }
        return "Error generating summary.";
    }
};

export const translateText = async (text: string, targetLang: 'en' | 'ar'): Promise<string> => {
    const ai = getClient();
    if (!ai) return text;
  
    try {
        const prompt = `Translate the following text to ${targetLang === 'ar' ? 'Arabic' : 'English'}. Keep technical terms accurate and maintain the formatting (Markdown tables, lists, etc):\n\n${text}`;
    
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest', // Updated model
            contents: prompt,
        });
    
        return response.text || text;
    } catch (error) {
        console.error("Gemini Translation Error:", error);
        return text;
    }
};

export const analyzeMarketData = async (dataContext: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "AI Analysis Unavailable";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest', // Updated model
            contents: `You are a financial analyst specializing in Egyptian and Global tech markets. Analyze this data snapshot and give 2 sentences of insight:\n${dataContext}`,
        });
        return response.text || "No insights available.";
    } catch (e: any) {
        if (e?.status === 429) return "Market Analysis: Live data stream paused (Quota).";
        return "Could not analyze market data.";
    }
}

export const generateSpeech = async (text: string): Promise<string | null> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        // Using the specific native audio preview model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025', // Updated model for native audio
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return null;
        return base64Audio;

    } catch (error) {
        console.error("Gemini TTS Error:", error);
        // Fallback or log if audio generation fails
        return null;
    }
}

export const analyzePodcast = async (url: string): Promise<any> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        const prompt = `
        You are a Podcast Analyst API.
        Target: Analyze the content at this link: ${url}. 

        Task:
        1. Use Google Search to find details/transcript/summary of this podcast episode.
        2. Perform the analysis below.
        3. Output VALID JSON only.

        Metrics to analyze:
        - Depth of Information
        - Technical Level
        - Authenticity
        - Speakers' Expertise
        - Clarity
        - Engagement
        - Relevance
        - Bias and Objectivity
        - Practical Applications
        - Pacing
        - Emotional Impact
        - Originality

        **JSON OUTPUT FORMAT**:
        {
            "podcastName": "string",
            "episodeTitle": "string",
            "score": 8,
            "summary": "string (A concise paragraph)",
            "metrics": [
                { "name": "Depth of Information", "finding": "string" },
                ... (repeat for all metrics)
            ],
            "recommendation": "string"
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest', // Updated model
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}]
            }
        });

        const parsed = parseAIResponse(response.text);
        if (parsed) return parsed;

        return {
            podcastName: "Analysis Failed",
            episodeTitle: "Error",
            score: 0,
            summary: "Could not generate structured analysis.",
            metrics: [],
            recommendation: "Please try again."
        };

    } catch (error: any) {
        console.error("Deep Analysis Error:", error);
        return null;
    }
};

export const analyzeTrends = async (articles: NewsItem[]): Promise<TrendAnalysis | null> => {
    const ai = getClient();
    if (!ai) return null;

    if (articles.length === 0) return null;

    const articleContext = articles.map(a => `- ${a.title}: ${a.description}`).join('\n');

    try {
        const prompt = `
        You are a Chief Editor for a major Tech Publication.
        
        Task: Analyze the following list of news headlines collected TODAY.
        Identify the most popular topics across these specific categories:
        1. Business
        2. Finance
        3. Technology
        4. AI
        5. Entrepreneurship
        6. Investment

        INPUT DATA:
        ${articleContext}

        **JSON OUTPUT FORMAT**:
        {
            "date": "${new Date().toISOString().split('T')[0]}",
            "executiveSummary": "string",
            "topics": [
                { "category": "AI", "topic": "string", "summary": "string", "sentiment": "string" },
                { "category": "Business", "topic": "string", "summary": "string", "sentiment": "string" },
                { "category": "Finance", "topic": "string", "summary": "string", "sentiment": "string" },
                { "category": "Technology", "topic": "string", "summary": "string", "sentiment": "string" },
                { "category": "Entrepreneurship", "topic": "string", "summary": "string", "sentiment": "string" },
                { "category": "Investment", "topic": "string", "summary": "string", "sentiment": "string" }
            ]
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest', // Updated model
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        return parseAIResponse(response.text);

    } catch (error: any) {
        console.error("Trend Analysis Error:", error);
        return null;
    }
};

export const fetchLatestFromSource = async (url: string): Promise<any> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        const prompt = `
        You are a Content Discovery API.
        Target Source: ${url}
        
        Task: Find the SINGLE latest news article or podcast episode from this source using Google Search.
        
        Instructions:
        1. Search for "latest news ${url} ${new Date().getFullYear()}" or "latest episode ${url}".
        2. Identify the most recent item (must be from last 7 days).
        3. Return ONLY a JSON object. Do not converse.
        
        JSON Format:
        {
           "title": "string",
           "description": "string",
           "source": "string (Source Name)",
           "specificUrl": "https://valid-deep-link", 
           "date": "YYYY-MM-DD",
           "category": "string (latest, startup, podcasts, events)",
           "duration": "string (optional)",
           "summaryPoints": ["point 1", "point 2"],
           "youtubeUrl": "string (optional)",
           "spotifyUrl": "string (optional)"
        }
        
        If no specific item is found, return null.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest', // Updated model
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}] 
            }
        });

        const parsed = parseAIResponse(response.text);
        
        if (parsed) {
            if (parsed.specificUrl === url || (parsed.specificUrl && !parsed.specificUrl.includes('/'))) {
                console.warn("AI returned homepage, invalid deep link.");
            }
            return parsed;
        }
        
        return null;

    } catch (error: any) {
        console.error("Smart Fetch Error:", error);
        if (error?.status === 429 || error?.code === 429) {
            alert("System is busy (Rate Limit). Please try again in a minute.");
        }
        return null;
    }
};

// NEW: Batch scraper for multiple articles
export const scrapeSiteForNewestArticles = async (url: string, sourceName: string): Promise<any[]> => {
    const ai = getClient();
    if (!ai) return [];

    try {
        const prompt = `
        You are a News Scraper.
        Target: ${sourceName} (${url})
        
        Task: Find the top 2 articles published TODAY or YESTERDAY.
        
        CRITICAL VALIDATION STEP:
        - Search for "latest news ${sourceName}".
        - Look at the date in the search snippet (e.g. "2 hours ago", "Dec 12, 2025").
        - If the date is older than 48 hours, DO NOT include it.
        - If no recent news is found, return empty array [].
        
        Topics: Business, Tech, AI, Finance.
        
        **JSON OUTPUT FORMAT**:
        [
            { 
              "title": "string", 
              "summary": "string", 
              "date": "YYYY-MM-DD", 
              "url": "https://valid-deep-link-to-article", 
              "source": "${sourceName}" 
            }
        ]
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest', // Updated model
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}]
            }
        });

        const parsed = parseAIResponse(response.text);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return [];

    } catch (error: any) {
        if (error?.status === 429 || error?.code === 429) {
            console.warn(`Rate Limit Hit for ${sourceName} - Skipping`);
            return []; 
        }
        console.error("Batch Scrape Error:", error);
        return [];
    }
}

export const getArticleContent = async (url: string, searchContext?: string): Promise<string> => {
    const ai = getClient();
    if (!ai) return "AI Service Unavailable";

    try {
        const prompt = `
        Source URL: ${url}
        Context: ${searchContext || ''}
        Task: Retrieve full article content. Format as Markdown.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest', // Updated model
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}]
            }
        });

        return response.text || "Could not retrieve article content.";
    } catch (error) {
        console.error("Article Extraction Error:", error);
        return "Error extracting article content.";
    }
};

export const fetchRealMarketData = async (): Promise<any> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        const prompt = `
        Task: Get live market rates for Egypt/Global Tech (USD/EGP, Gold 21k, NASDAQ, BTC).
        Output JSON: { "egpRate": { "value": 0, "change": 0, "trend": "neutral" }, "goldEg": { "value": 0, "trend": "neutral" }, "nasdaq": { "value": 0, "change": 0, "trend": "neutral" }, "btc": { "value": 0, "change": 0, "trend": "neutral" }, "marketSummary": "string" }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest', // Updated model
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        return parseAIResponse(response.text);

    } catch (error) {
        console.error("Market Data Fetch Error:", error);
        return null;
    }
};

export const reviewContent = async (data: any): Promise<any> => {
    const ai = getClient();
    if (!ai) return null;

    try {
        const prompt = `
        Review submission: ${data.title}.
        Output JSON: { "improvedTitle": "string", "improvedDescription": "string", "feedback": "string" }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest', // Updated model
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        return parseAIResponse(response.text);
    } catch (error) {
        console.error("Content Review Error:", error);
        return null;
    }
};

export const sendMessageToAssistant = async (
    history: ChatMessage[],
    newMessage: string,
    contextData?: string
): Promise<string> => {
    const ai = getClient();
    if (!ai) return "I'm sorry, I cannot connect to the AI service right now.";

    try {
        const systemInstruction = `You are NexusMena AI, a specialized assistant for the NexusMena tech platform. 
    You have access to Global and Egyptian tech news, startups, events, and market data.
    Your goal is to help users find information within the platform, summarize articles, or explain complex tech/financial concepts.
    Be concise, professional, and helpful. 
    If provided with Context Data, prioritize that information.
    Answer in the language the user speaks (English or Arabic).`;

        const chat = ai.chats.create({
            model: 'gemini-flash-latest', // Updated model
            config: {
                systemInstruction,
            },
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.content }]
            }))
        });

        let messageToSend = newMessage;
        if (contextData) {
            messageToSend = `[Context from current page: ${contextData}]\n\nUser Question: ${newMessage}`;
        }

        const result = await chat.sendMessage({ message: messageToSend });
        // Ensure result.text is always a string, as the function returns Promise<string>
        // and handle the case where result.text might be undefined.
        return result.text || "I'm sorry, I couldn't generate a response.";

    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "I encountered an error processing your request.";
    }
};
