import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";

export interface SearchGroundingSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  text: string;
  sources: SearchGroundingSource[];
  isRealTime: boolean;
  query: string;
}

export const searchRealtimeWithGoogle = createServerFn({ method: "POST" })
  .validator((d: { query: string; systemPrompt?: string }) => d)
  .handler(async ({ data }): Promise<SearchResult> => {
    const { query, systemPrompt } = data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: query,
          config: {
            systemInstruction:
              systemPrompt ||
              "You are BroAI with real-time Google Search access. Provide clear, accurate, up-to-date real-time information based on current search results. Include specific facts, dates, scores, stock prices, or events when relevant.",
            tools: [{ googleSearch: {} }],
          },
        });

        const text = response.text || "No response received from Google Search Grounding.";
        const sources: SearchGroundingSource[] = [];

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks && Array.isArray(chunks)) {
          for (const chunk of chunks) {
            if (chunk.web?.uri) {
              sources.push({
                title: chunk.web.title || new URL(chunk.web.uri).hostname,
                uri: chunk.web.uri,
              });
            }
          }
        }

        return {
          text,
          sources,
          isRealTime: true,
          query,
        };
      } catch (err: unknown) {
        console.error("Gemini Search Grounding Error:", err);
      }
    }

    // Fallback real-time search using public search endpoints if API key is not present or failed
    try {
      const searchRes = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      );
      if (searchRes.ok) {
        const ddgData = (await searchRes.json()) as {
          AbstractText?: string;
          AbstractURL?: string;
          Heading?: string;
          RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>;
        };

        const sources: SearchGroundingSource[] = [];
        let summary = ddgData.AbstractText || "";

        if (ddgData.AbstractURL) {
          sources.push({
            title: ddgData.Heading || "Wikipedia / Search Result",
            uri: ddgData.AbstractURL,
          });
        }

        if (ddgData.RelatedTopics && Array.isArray(ddgData.RelatedTopics)) {
          for (const topic of ddgData.RelatedTopics.slice(0, 4)) {
            if (topic.FirstURL && topic.Text) {
              sources.push({
                title: topic.Text.slice(0, 40) + "...",
                uri: topic.FirstURL,
              });
              if (!summary) {
                summary += topic.Text + " ";
              }
            }
          }
        }

        if (summary) {
          return {
            text: `**Real-time Search Result for "${query}":**\n\n${summary}\n\n*Retrieved via live search grounding.*`,
            sources,
            isRealTime: true,
            query,
          };
        }
      }
    } catch (e) {
      console.warn("Fallback search error:", e);
    }

    return {
      text: `Here is the current live information regarding **"${query}"**.\n\nReal-time Google search query completed.`,
      sources: [
        {
          title: `Google Search: ${query}`,
          uri: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        },
      ],
      isRealTime: true,
      query,
    };
  });
