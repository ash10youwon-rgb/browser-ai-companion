import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Image as ImageIcon, Film, Cpu, CodeXml, Menu } from "lucide-react";
import { TabType, ModelInfo, ChatMessage, Conversation, WebGpuStats, AppSettings } from "@/types";
import {
  INITIAL_MODELS,
  INITIAL_GPU_STATS,
  INITIAL_SETTINGS,
  INITIAL_CHAT_MESSAGES,
} from "@/data/mockData";
import { Sidebar } from "@/components/Sidebar";
import { ChatView } from "@/components/ChatView";
import { ImageLabView } from "@/components/ImageLabView";
import { VideoLabView } from "@/components/VideoLabView";
import { ModelsView } from "@/components/ModelsView";
import { CodeSandboxView } from "@/components/CodeSandboxView";
import { SettingsView } from "@/components/SettingsView";
import { HistoryView } from "@/components/HistoryView";
import { AboutView } from "@/components/AboutView";
import { searchRealtimeWithGoogle } from "@/services/geminiSearch";
import { detectWebGpuHardware, streamBrowserLLMResponse } from "@/services/browserLLMEngine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BroAI — Private Local LLMs in Your Browser" },
      {
        name: "description",
        content:
          "BroAI runs open LLMs 100% locally in your browser with WebGPU. No servers, no tracking, full privacy.",
      },
    ],
  }),
  component: AppIndex,
});

function AppIndex() {
  const [currentTab, setCurrentTab] = useState<TabType>("chat");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [models, setModels] = useState<ModelInfo[]>(INITIAL_MODELS);
  const [selectedModel, setSelectedModel] = useState<ModelInfo>(
    INITIAL_MODELS[0] || {
      id: "qwen-2.5-7b",
      name: "Qwen 2.5 7B Instruct",
      family: "Alibaba Qwen",
      size: "4.4 GB",
      vram: "5.2 GB",
      speed: "28.4 tok/s",
      quantization: "q4f16_1",
      contextWindow: "32,768",
      description: "Premier multilingual reasoning & coding model.",
      loaded: true,
      tags: ["Coding", "Reasoning"],
    },
  );
  const [gpuStats, setGpuStats] = useState<WebGpuStats>(INITIAL_GPU_STATS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [activeConversationId, setActiveConversationId] = useState<string>("conv-initial");
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "conv-initial",
      title: "Greeting & Introduction",
      modelId: "qwen-2.5-7b",
      createdAt: Date.now() - 60000,
      updatedAt: Date.now() - 58000,
      messages: INITIAL_CHAT_MESSAGES,
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sandboxCode, setSandboxCode] = useState<string | undefined>(undefined);

  // Detect actual WebGPU device hardware on initial load
  useEffect(() => {
    async function initHardware() {
      try {
        const hw = await detectWebGpuHardware();
        setGpuStats((prev) => ({
          ...prev,
          deviceName: hw.adapterName,
          backend: hw.backend,
          memoryTotalGb: hw.vramEstimatedGb,
          maxBufferSizeMb: hw.maxBufferSizeMb,
        }));
      } catch (err) {
        console.warn("WebGPU initialization inquiry:", err);
      }
    }
    initHardware();
  }, []);

  // Periodic subtle GPU temperature & metric fluctuation to give realistic hardware telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setGpuStats((prev) => {
        const delta = (Math.random() - 0.5) * 1.5;
        const newTemp = Math.min(78, Math.max(55, Math.round(prev.temperatureC + delta)));
        return {
          ...prev,
          temperatureC: newTemp,
        };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleNewChat = () => {
    const newConvId = `conv-${Date.now()}`;
    const initialMsgs = INITIAL_CHAT_MESSAGES;
    const newConv: Conversation = {
      id: newConvId,
      title: "New Chat",
      modelId: selectedModel.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: initialMsgs,
    };

    setConversations((prev) => [
      newConv,
      ...prev.filter((c) => c.id !== "conv-initial" || c.messages.length > 2),
    ]);
    setActiveConversationId(newConvId);
    setMessages(initialMsgs);
    setIsStreaming(false);
    setStreamingContent("");
    setCurrentTab("chat");
  };

  const handleSendMessage = async (
    text: string,
    options?: { webSearch?: boolean; imageAttached?: string; codeSnippet?: string },
  ) => {
    if (isStreaming) return;

    // Grounded mode is strictly opt-in via user boolean (e.g. search toggle button)
    const isGroundedMode = Boolean(options?.webSearch);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
      webSearchUsed: isGroundedMode,
      imageAttached: options?.imageAttached,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsStreaming(true);
    setStreamingContent("");

    let updatedMessages: ChatMessage[] = [];

    try {
      if (isGroundedMode) {
        // ==========================================
        // GROUNDED MODE (Opt-in via explicit toggle)
        // Routes through live Google Search Grounding
        // ==========================================
        setStreamingContent("Fetching real-time Google Search Grounding data...");

        let liveSearchText = "";
        let liveSources: Array<{ title: string; uri: string }> | undefined = undefined;

        try {
          const searchResult = await searchRealtimeWithGoogle({
            data: { query: text, systemPrompt: settings.systemPrompt },
          });
          if (searchResult && searchResult.text) {
            liveSearchText = searchResult.text;
            liveSources = searchResult.sources;
          }
        } catch (searchErr) {
          console.warn("Search Grounding query note:", searchErr);
          liveSearchText = `Unable to reach live search grounding services right now. Query: "${text}". Please verify network connectivity.`;
        }

        // Stream the live web result
        const streamResult = await streamBrowserLLMResponse({
          model: selectedModel,
          prompt: text,
          providedText: liveSearchText,
          systemPrompt: settings.systemPrompt,
          temperature: settings.temperature,
          topP: settings.topP,
          onToken: (_token, fullText, telemetry) => {
            setStreamingContent(fullText);
            setGpuStats((prev) => ({
              ...prev,
              tokensPerSec: telemetry.speedTokPerSec,
            }));
          },
        });

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: streamResult.fullText,
          timestamp: Date.now(),
          speedTokPerSec: streamResult.speedTokPerSec || gpuStats.tokensPerSec,
          durationSec: streamResult.elapsedSec || 1.2,
          modelUsed: "live-search-grounded",
          sources: liveSources,
        };

        updatedMessages = [...newMessages, assistantMessage];
        setMessages(updatedMessages);
      } else {
        // ==========================================
        // PRIVATE MODE (Default, 100% Client-Side)
        // Uses purely in-browser WebGPU inference with zero network calls
        // ==========================================
        setStreamingContent(`Thinking with ${selectedModel.name}...`);

        const streamResult = await streamBrowserLLMResponse({
          model: selectedModel,
          prompt: text,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
            imageAttached: m.imageAttached,
          })),
          systemPrompt: settings.systemPrompt,
          temperature: settings.temperature,
          topP: settings.topP,
          onToken: (_token, fullText, telemetry) => {
            setStreamingContent(fullText);
            setGpuStats((prev) => ({
              ...prev,
              tokensPerSec: telemetry.speedTokPerSec,
            }));
          },
          onStatus: (status) => {
            setStreamingContent(status);
          },
        });

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: streamResult.fullText,
          timestamp: Date.now(),
          speedTokPerSec: streamResult.speedTokPerSec || gpuStats.tokensPerSec,
          durationSec: streamResult.elapsedSec || 1.2,
          modelUsed: selectedModel.id,
        };

        updatedMessages = [...newMessages, assistantMessage];
        setMessages(updatedMessages);
      }
      setIsStreaming(false);
      setStreamingContent("");

      // Save conversation history
      setConversations((prev) => {
        const title = text.slice(0, 36) + (text.length > 36 ? "..." : "");
        const existingIndex = prev.findIndex((c) => c.id === activeConversationId);

        if (existingIndex >= 0) {
          const updated = [...prev];
          const currentConv = updated[existingIndex]!;
          const newTitle =
            currentConv.title === "New Chat" || currentConv.title === "Greeting & Introduction"
              ? title
              : currentConv.title;

          updated[existingIndex] = {
            ...currentConv,
            title: newTitle,
            modelId: selectedModel.id,
            updatedAt: Date.now(),
            messages: updatedMessages,
          };
          return updated;
        }

        const newConv: Conversation = {
          id: activeConversationId,
          title: title,
          modelId: selectedModel.id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: updatedMessages,
        };
        return [newConv, ...prev.slice(0, 19)];
      });
    } catch (err) {
      console.error("Browser WebGPU LLM inference error:", err);
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_CHAT_MESSAGES);
    setIsStreaming(false);
    setStreamingContent("");
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, messages: INITIAL_CHAT_MESSAGES, updatedAt: Date.now() }
          : c,
      ),
    );
  };

  const handleSelectModel = (model: ModelInfo) => {
    setSelectedModel(model);
    setModels((prev) =>
      prev.map((m) => ({
        ...m,
        loaded: m.id === model.id,
      })),
    );

    // Calculate dynamic VRAM memory allocation in WebGPU stats
    const parsedVram = parseFloat(model.vram || model.size || "1.0");
    const vramGb = isNaN(parsedVram)
      ? 1.5
      : model.vram?.includes("MB") || model.size?.includes("MB")
        ? parsedVram / 1024
        : parsedVram;
    const nominalSpeed = parseFloat(model.speed || "45.0") || 45.0;

    setGpuStats((prev) => ({
      ...prev,
      memoryUsedGb: Number(Math.max(0.3, vramGb).toFixed(2)),
      tokensPerSec: nominalSpeed,
    }));
  };

  const handleLoadModel = (modelId: string) => {
    const target = models.find((m) => m.id === modelId);
    if (target) {
      handleSelectModel(target);
    }
  };

  const handleOpenCodeSandbox = (code?: string) => {
    if (code) {
      setSandboxCode(code);
    }
    setCurrentTab("code-sandbox");
  };

  const handleLoadConversation = (conv: Conversation) => {
    setActiveConversationId(conv.id);
    setMessages(conv.messages);
    const m = models.find((mod) => mod.id === conv.modelId);
    if (m) {
      setSelectedModel(m);
    }
    setCurrentTab("chat");
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (id === activeConversationId) {
        if (remaining.length > 0 && remaining[0]) {
          setActiveConversationId(remaining[0].id);
          setMessages(remaining[0].messages);
        } else {
          const freshId = `conv-${Date.now()}`;
          const freshConv: Conversation = {
            id: freshId,
            title: "New Chat",
            modelId: selectedModel.id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: INITIAL_CHAT_MESSAGES,
          };
          setActiveConversationId(freshId);
          setMessages(INITIAL_CHAT_MESSAGES);
          return [freshConv];
        }
      }
      return remaining;
    });
  };

  const handleClearAllHistory = () => {
    const freshId = `conv-${Date.now()}`;
    const freshConv: Conversation = {
      id: freshId,
      title: "New Chat",
      modelId: selectedModel.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: INITIAL_CHAT_MESSAGES,
    };
    setConversations([freshConv]);
    setActiveConversationId(freshId);
    setMessages(INITIAL_CHAT_MESSAGES);
  };

  const activeChat = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b12] text-slate-100 font-sans selection:bg-[#1e40af] selection:text-white relative">
      {/* Sidebar with New Chat & Recent Chats (Responsive Desktop + Mobile Drawer) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setIsMobileMenuOpen(false);
        }}
        gpuStats={gpuStats}
        onNewChat={handleNewChat}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleLoadConversation}
        onDeleteConversation={handleDeleteConversation}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        {currentTab === "chat" && (
          <ChatView
            messages={messages}
            models={models}
            selectedModel={selectedModel}
            onSelectModel={handleSelectModel}
            onClearChat={handleClearChat}
            onNewChat={handleNewChat}
            activeChatTitle={activeChat?.title}
            onSendMessage={handleSendMessage}
            onOpenModelModal={() => setCurrentTab("models")}
            onOpenCodeSandbox={handleOpenCodeSandbox}
            gpuStats={gpuStats}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          />
        )}

        {currentTab === "image-lab" && <ImageLabView gpuStats={gpuStats} />}

        {currentTab === "video-lab" && <VideoLabView gpuStats={gpuStats} />}

        {currentTab === "models" && (
          <ModelsView
            models={models}
            selectedModel={selectedModel}
            onSelectModel={handleSelectModel}
            onLoadModel={handleLoadModel}
            gpuStats={gpuStats}
          />
        )}

        {currentTab === "code-sandbox" && <CodeSandboxView initialCode={sandboxCode} />}

        {currentTab === "settings" && (
          <SettingsView settings={settings} onUpdateSettings={setSettings} gpuStats={gpuStats} />
        )}

        {currentTab === "history" && (
          <HistoryView
            conversations={conversations}
            onLoadConversation={handleLoadConversation}
            onDeleteConversation={handleDeleteConversation}
            onClearAllHistory={handleClearAllHistory}
          />
        )}

        {currentTab === "about" && <AboutView />}

        {/* Mobile Bottom Navigation Bar matching modern app UX */}
        <nav
          id="mobile-bottom-nav"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/95 border-t border-[#15233b] backdrop-blur-xl px-1.5 py-1 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
        >
          <button
            onClick={() => setCurrentTab("chat")}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition cursor-pointer min-w-[56px] ${
              currentTab === "chat"
                ? "text-[#38bdf8] font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare
              className={`h-5 w-5 mb-0.5 ${currentTab === "chat" ? "text-[#38bdf8]" : ""}`}
            />
            <span>Chat</span>
          </button>

          <button
            onClick={() => setCurrentTab("image-lab")}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium transition cursor-pointer min-w-[50px] ${
              currentTab === "image-lab"
                ? "text-[#e879f9] font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ImageIcon
              className={`h-5 w-5 mb-0.5 ${currentTab === "image-lab" ? "text-[#e879f9]" : ""}`}
            />
            <span>Images</span>
          </button>

          <button
            onClick={() => setCurrentTab("video-lab")}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium transition cursor-pointer min-w-[50px] ${
              currentTab === "video-lab"
                ? "text-purple-400 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Film
              className={`h-5 w-5 mb-0.5 ${currentTab === "video-lab" ? "text-purple-400" : ""}`}
            />
            <span>Videos</span>
          </button>

          <button
            onClick={() => setCurrentTab("models")}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-medium transition cursor-pointer min-w-[50px] ${
              currentTab === "models"
                ? "text-[#38bdf8] font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className={`h-5 w-5 mb-0.5 ${currentTab === "models" ? "text-[#38bdf8]" : ""}`} />
            <span>Models</span>
          </button>

          <button
            onClick={() => setCurrentTab("code-sandbox")}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition cursor-pointer min-w-[56px] ${
              currentTab === "code-sandbox"
                ? "text-amber-400 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CodeXml
              className={`h-5 w-5 mb-0.5 ${currentTab === "code-sandbox" ? "text-amber-400" : ""}`}
            />
            <span>Sandbox</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-medium text-slate-400 hover:text-slate-200 transition cursor-pointer min-w-[56px]"
          >
            <Menu className="h-5 w-5 mb-0.5" />
            <span>More</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
