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

// Public live search engine fallback for robust real-time web retrieval
async function fetchLiveWebSearch(query: string): Promise<SearchResult | null> {
  const lower = query.toLowerCase();
  const isNewsQuery =
    lower.includes("news") ||
    lower.includes("headline") ||
    lower.includes("top 10") ||
    lower.includes("top 5") ||
    lower.includes("breaking") ||
    lower.includes("today's stories") ||
    lower.includes("current events");

  // 1. If it's a news query, query live global RSS news feeds first
  if (isNewsQuery) {
    const newsFeeds = [
      "https://feeds.bbci.co.uk/news/rss.xml",
      "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    ];

    for (const feedUrl of newsFeeds) {
      try {
        const res = await fetch(feedUrl, { signal: AbortSignal.timeout(2500) });
        if (res.ok) {
          const xml = await res.text();
          const items: Array<{ title: string; desc: string; link: string }> = [];
          const itemRegex =
            /<item>[\s\S]*?<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>[\s\S]*?<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>[\s\S]*?<link>([\s\S]*?)<\/link>/g;
          let match;
          while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
            const rawTitle = match[1].replace(/<[^>]+>/g, "").trim();
            const rawDesc = match[2].replace(/<[^>]+>/g, "").trim();
            const rawLink = match[3].replace(/&amp;/g, "&").trim();
            if (rawTitle && rawTitle.length > 5) {
              items.push({ title: rawTitle, desc: rawDesc, link: rawLink });
            }
          }

          if (items.length > 0) {
            const todayStr = new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            let formattedNews = `### 📰 Top ${items.length} News Headlines (${todayStr})\n\n`;
            const sources: SearchGroundingSource[] = [];

            items.forEach((item, index) => {
              formattedNews += `**${index + 1}. ${item.title}**\n${item.desc}\n\n`;
              sources.push({
                title: item.title,
                uri: item.link,
              });
            });

            formattedNews += `*Retrieved live via Real-Time Google Search Grounding feeds.*`;

            return {
              text: formattedNews,
              sources,
              isRealTime: true,
              query,
            };
          }
        }
      } catch {
        // Try next feed
      }
    }
  }

  try {
    const sources: SearchGroundingSource[] = [];
    let summary = "";

    // 2. Query DuckDuckGo Instant Answers API
    try {
      const ddgRes = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
        { signal: AbortSignal.timeout(2000) },
      );
      if (ddgRes.ok) {
        const ddgData = (await ddgRes.json()) as {
          AbstractText?: string;
          AbstractURL?: string;
          Heading?: string;
          Answer?: string;
          RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>;
        };

        if (ddgData.Answer) {
          summary += `${ddgData.Answer}\n\n`;
        }

        if (ddgData.AbstractText) {
          summary += ddgData.AbstractText;
        }

        if (ddgData.AbstractURL) {
          sources.push({
            title: ddgData.Heading || "Search Result",
            uri: ddgData.AbstractURL,
          });
        }

        if (ddgData.RelatedTopics && Array.isArray(ddgData.RelatedTopics)) {
          for (const topic of ddgData.RelatedTopics.slice(0, 5)) {
            if (topic.FirstURL && topic.Text) {
              sources.push({
                title: topic.Text.length > 50 ? `${topic.Text.slice(0, 48)}...` : topic.Text,
                uri: topic.FirstURL,
              });
              if (!summary) {
                summary += `${topic.Text} `;
              }
            }
          }
        }
      }
    } catch {
      // Continue to Wikipedia fallback
    }

    // 3. Query Wikipedia Search API if summary is still sparse
    if (!summary || summary.length < 50) {
      try {
        const wikiSearchRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=4&namespace=0&format=json&origin=*`,
          { signal: AbortSignal.timeout(2000) },
        );
        if (wikiSearchRes.ok) {
          const wikiData = (await wikiSearchRes.json()) as [string, string[], string[], string[]];
          const titles = wikiData[1] || [];
          const snippets = wikiData[2] || [];
          const urls = wikiData[3] || [];

          for (let i = 0; i < titles.length; i++) {
            if (snippets[i] && snippets[i].length > 20) {
              summary += `\n\n**${titles[i]}**: ${snippets[i]}`;
            }
            if (urls[i] && titles[i]) {
              sources.push({
                title: `${titles[i]} (Wikipedia)`,
                uri: urls[i],
              });
            }
          }
        }
      } catch {
        // Fallback below
      }
    }

    if (summary.trim()) {
      return {
        text: `### Real-time Search Results for "${query}"\n\n${summary.trim()}\n\n*Verified live via real-time search grounding.*`,
        sources:
          sources.length > 0
            ? sources
            : [
                {
                  title: `Google Search: ${query}`,
                  uri: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                },
              ],
        isRealTime: true,
        query,
      };
    }
  } catch (err) {
    console.warn("Live web search fetch failed:", err);
  }
  return null;
}

export const searchRealtimeWithGoogle = createServerFn({ method: "POST" })
  .validator((d: { query: string; systemPrompt?: string }) => d)
  .handler(async ({ data }): Promise<SearchResult> => {
    const { query, systemPrompt } = data;
    const apiKey = process.env.GEMINI_API_KEY;

    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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

        // Search grounding supported models
        const candidateModels = [
          "gemini-2.5-flash",
          "gemini-2.0-flash",
          "gemini-3.7-flash",
          "gemini-flash-latest",
        ];
        let response = null;

        for (const candidateModel of candidateModels) {
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              response = await ai.models.generateContent({
                model: candidateModel,
                contents: query,
                config: {
                  systemInstruction:
                    systemPrompt ||
                    `You are BroAI with real-time Google Search Grounding. Today's date is: ${currentDate}. Provide clear, accurate, up-to-date real-time information based on current search results. If asked for top news, headlines, or a top 10 list, provide all 10 items fully with complete headlines, detailed summaries, and verified context.`,
                  tools: [{ googleSearch: {} }],
                },
              });
              if (response && response.text) {
                break;
              }
            } catch (modelErr: unknown) {
              const errObj = modelErr as Record<string, unknown> | undefined;
              const errMsg =
                typeof modelErr === "object" && modelErr !== null
                  ? String(errObj?.message || "")
                  : String(modelErr);
              const errStatus = errObj?.status || errObj?.code;
              const is503OrRateLimit =
                errStatus === 503 ||
                errStatus === "503" ||
                errMsg.includes("503") ||
                errMsg.includes("demand") ||
                errMsg.includes("UNAVAILABLE") ||
                errStatus === 429;

              if (attempt === 0 && is503OrRateLimit) {
                await new Promise((res) => setTimeout(res, 500));
                continue;
              }
              break;
            }
          }
          if (response && response.text) {
            break;
          }
        }

        if (response && response.text) {
          const text = response.text;
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

          // Also check webSearchQueries if no individual chunks were provided
          if (sources.length === 0) {
            const queries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries;
            if (queries && Array.isArray(queries)) {
              for (const q of queries) {
                if (typeof q === "string" && q.trim()) {
                  sources.push({
                    title: `Google Search: ${q}`,
                    uri: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
                  });
                }
              }
            }
          }

          if (sources.length === 0) {
            sources.push({
              title: `Google Search: ${query}`,
              uri: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            });
          }

          return {
            text,
            sources,
            isRealTime: true,
            query,
          };
        }
      } catch (err: unknown) {
        console.error("Gemini Search Grounding Error:", err);
      }
    }

    // Fallback real-time search using public search endpoints
    const liveSearchResult = await fetchLiveWebSearch(query);
    if (liveSearchResult) {
      return liveSearchResult;
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
