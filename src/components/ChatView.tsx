import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Send,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  FileCode,
  Terminal,
  Globe,
  Image as ImageIcon,
  Lock,
  Sparkles,
  RefreshCw,
  X,
  Activity,
  Plus,
  MessageSquarePlus,
  Menu,
  Download,
  Loader2,
  Sliders,
  SlidersHorizontal,
  Cpu,
  Zap,
  Info,
  ShieldCheck,
} from "lucide-react";
import { ChatMessage, ModelInfo, WebGpuStats } from "@/types";
import { QUICK_SUGGESTIONS, KNOWLEDGE_BASE_RESPONSES } from "@/data/mockData";
import { HardwareMonitorCard } from "./HardwareMonitorCard";
import { CodeSandboxCard } from "./CodeSandboxCard";
import { SearchGroundingBanner } from "./SearchGroundingBanner";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { isModelLoadedInVRAM, preloadModelInVRAM } from "@/services/browserLLMEngine";

interface ChatViewProps {
  messages: ChatMessage[];
  models: ModelInfo[];
  selectedModel: ModelInfo;
  onSelectModel: (model: ModelInfo) => void;
  onLoadModel?: (modelId: string) => void;
  onClearChat: () => void;
  onNewChat: () => void;
  activeChatTitle?: string;
  onSendMessage: (
    text: string,
    options?: { webSearch?: boolean; imageAttached?: string; codeSnippet?: string },
  ) => void;
  onOpenModelModal: () => void;
  onOpenCodeSandbox: (initialCode?: string) => void;
  gpuStats: WebGpuStats;
  isStreaming: boolean;
  streamingContent: string;
  onToggleMobileMenu?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  models,
  selectedModel,
  onSelectModel,
  onLoadModel,
  onClearChat,
  onNewChat,
  activeChatTitle,
  onSendMessage,
  onOpenModelModal,
  onOpenCodeSandbox,
  gpuStats,
  isStreaming,
  streamingContent,
  onToggleMobileMenu,
}) => {
  const [inputText, setInputText] = useState("");
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [thumbsUpMap, setThumbsUpMap] = useState<Record<string, boolean>>({});
  const [thumbsDownMap, setThumbsDownMap] = useState<Record<string, boolean>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [webSearchActive, setWebSearchActive] = useState(false);
  const [showSearchGroundingBanner, setShowSearchGroundingBanner] = useState(true);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showCodeHelper, setShowCodeHelper] = useState(false);

  // Model loading and parameters state
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadingStatusText, setLoadingStatusText] = useState("");
  const [showParamDrawer, setShowParamDrawer] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(1024);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Whether current model is loaded in memory
  const isCurrentModelLoaded = selectedModel.loaded || isModelLoadedInVRAM(selectedModel.id);

  // Trigger loading model weights into WebGPU VRAM
  const handleTriggerLoadModel = async () => {
    if (isModelLoading) return;
    setIsModelLoading(true);
    setLoadProgress(5);
    setLoadingStatusText(`Connecting to WebGPU shaders for ${selectedModel.name}...`);

    try {
      await preloadModelInVRAM(selectedModel.id, (pct, statusText) => {
        setLoadProgress(pct);
        setLoadingStatusText(statusText);
      });

      onLoadModel?.(selectedModel.id);
      onSelectModel({ ...selectedModel, loaded: true });
      setLoadProgress(100);
      setLoadingStatusText("Model loaded into WebGPU memory!");

      setTimeout(() => {
        setIsModelLoading(false);
      }, 1400);
    } catch (err) {
      console.error("Error loading model:", err);
      setLoadingStatusText(`Loading failed: ${(err as Error).message || "Unknown error"}`);
      setTimeout(() => {
        setIsModelLoading(false);
      }, 3000);
    }
  };

  // Auto scroll to bottom when messages or stream update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, isStreaming]);

  // Click outside to close model dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if ((!inputText.trim() && !attachedImage) || isStreaming) return;
    onSendMessage(inputText.trim(), {
      webSearch: webSearchActive,
      imageAttached: attachedImage || undefined,
    });
    setInputText("");
    setAttachedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const toggleThumbsUp = (id: string) => {
    setThumbsUpMap((prev) => ({ ...prev, [id]: !prev[id] }));
    setThumbsDownMap((prev) => ({ ...prev, [id]: false }));
  };

  const toggleThumbsDown = (id: string) => {
    setThumbsDownMap((prev) => ({ ...prev, [id]: !prev[id] }));
    setThumbsUpMap((prev) => ({ ...prev, [id]: false }));
  };

  const handleInsertCodeTemplate = () => {
    const template =
      "```python\ndef solve_problem(input_data):\n    # Write local GPU accelerated logic here\n    return result\n```\n";
    setInputText((prev) => prev + (prev ? "\n" : "") + template);
    setShowCodeHelper(false);
    textareaRef.current?.focus();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      id="chat-workspace-view"
      className="flex-1 flex flex-col h-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans relative"
    >
      {/* Top Header matching screenshot */}
      <header className="h-16 border-b border-[#151f33] px-3 sm:px-6 flex items-center justify-between bg-[#080d17]/90 backdrop-blur-md z-20 flex-shrink-0 gap-2">
        {/* Left Side: Mobile Menu + Model Selector + Load Model + WebGPU Status Badge + Settings */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {onToggleMobileMenu && (
            <button
              id="mobile-sidebar-toggle-btn"
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 -ml-1 rounded-xl text-slate-300 hover:text-white hover:bg-[#121b2d] transition cursor-pointer shrink-0"
              title="Open Navigation"
              aria-label="Open Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Model Selector Dropdown matching screenshot */}
          <div
            className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md min-w-[160px]"
            ref={dropdownRef}
          >
            <button
              id="model-selector-dropdown-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-[#0b1220] border border-[#1c2c47] hover:border-[#0284c7]/70 text-xs sm:text-sm rounded-xl px-3 py-2 text-slate-200 flex items-center justify-between gap-2 transition-all cursor-pointer group shadow-inner"
              title={selectedModel.name}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-medium text-slate-100 group-hover:text-[#38bdf8] transition truncate">
                  {selectedModel.name}
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline shrink-0">
                  ({selectedModel.size || selectedModel.vram})
                </span>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 shrink-0 ${
                  isDropdownOpen ? "rotate-180 text-[#38bdf8]" : ""
                }`}
              />
            </button>

            {/* Model Switcher Dropdown Menu */}
            {isDropdownOpen && (
              <div
                id="model-dropdown-menu"
                className="absolute left-0 top-full mt-1.5 w-[calc(100vw-32px)] max-w-md bg-[#070e1b] border border-[#1a2942] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="max-h-[420px] overflow-y-auto divide-y divide-[#101b2d]">
                  {(
                    [
                      "Micro & Instant Models",
                      "Fast & Light Models",
                      "Mid & Logic Models",
                      "Flagship & Reasoning Models",
                    ] as const
                  ).map((categoryName) => {
                    const categoryModels = models.filter((m) => m.category === categoryName);
                    if (categoryModels.length === 0) return null;

                    return (
                      <div key={categoryName} className="py-1.5">
                        <div className="px-3.5 py-1 text-xs font-bold text-[#38bdf8] select-none tracking-wide">
                          {categoryName}
                        </div>
                        <div className="space-y-0.5 px-1">
                          {categoryModels.map((model) => {
                            const isSelected = selectedModel.id === model.id;
                            const isModLoaded = model.loaded || isModelLoadedInVRAM(model.id);

                            return (
                              <button
                                key={model.id}
                                id={`select-model-${model.id}`}
                                onClick={() => {
                                  onSelectModel(model);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition cursor-pointer ${
                                  isSelected
                                    ? "bg-[#0284c7] text-white font-semibold shadow-sm"
                                    : "text-slate-200 hover:bg-[#121f35] hover:text-white"
                                }`}
                              >
                                <div className="truncate pr-2">
                                  <div className="font-medium truncate">{model.name}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {model.size} · {model.speed} · {model.family}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {isModLoaded && (
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                                      Loaded
                                    </span>
                                  )}
                                  {isSelected && (
                                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-white" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[#16233b] bg-[#050b16] py-2.5 px-3.5 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {models.length} WebGPU models available
                  </span>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenModelModal();
                    }}
                    className="text-xs text-[#38bdf8] hover:underline font-semibold cursor-pointer"
                  >
                    Manage Hub →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Load Model Action Button matching screenshot */}
          <button
            id="load-model-header-btn"
            onClick={handleTriggerLoadModel}
            disabled={isModelLoading}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0 cursor-pointer ${
              isModelLoading
                ? "bg-[#0369a1] text-white animate-pulse shadow-[#0284c7]/20"
                : isCurrentModelLoaded
                  ? "bg-[#059669] hover:bg-[#047857] text-white shadow-emerald-600/20"
                  : "bg-[#0284c7] hover:bg-[#0275b0] text-white shadow-[#0284c7]/30"
            }`}
            title={
              isCurrentModelLoaded
                ? "Model weights are active in WebGPU VRAM. Click to reload if needed."
                : "Load model weights into browser WebGPU memory"
            }
          >
            {isModelLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-200" />
                <span>Loading {loadProgress}%</span>
              </>
            ) : isCurrentModelLoaded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Loaded</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Load Model</span>
              </>
            )}
          </button>

          {/* WebGPU Status Badge matching screenshot */}
          <div
            id="header-webgpu-badge"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shrink-0 select-none"
            title={`WebGPU Hardware Backend: ${gpuStats.backend || "Ready"} · ${gpuStats.deviceName}`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>WebGPU Ready</span>
          </div>

          {/* Settings / Parameters Toggle Button matching screenshot */}
          <button
            id="header-sliders-btn"
            onClick={() => setShowParamDrawer(!showParamDrawer)}
            className={`p-2 rounded-xl border transition-colors shrink-0 cursor-pointer ${
              showParamDrawer
                ? "bg-[#0284c7] text-white border-[#0284c7]"
                : "text-slate-400 hover:text-white bg-[#0b1220] hover:bg-[#121c2d] border-[#1c2c47]"
            }`}
            title="Model Parameters & VRAM Telemetry"
            aria-label="Model Parameters"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {activeChatTitle && (
            <span className="hidden xl:inline-block max-w-[150px] truncate text-xs text-slate-400 font-medium px-2.5 py-1 rounded-lg bg-[#0b1322] border border-[#16253c]">
              {activeChatTitle}
            </span>
          )}

          {/* New Chat Button */}
          <button
            id="chat-header-new-chat-button"
            onClick={onNewChat}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-[#0ea5e9] hover:opacity-95 px-2.5 sm:px-3 py-1.5 rounded-xl transition cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.3)] active:scale-[0.98]"
            title="Start New Chat"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden md:inline">New Chat</span>
          </button>

          {/* Clear Chat Button */}
          <button
            id="clear-chat-button"
            onClick={onClearChat}
            className="text-xs font-medium text-slate-300 hover:text-white bg-[#0e1626] hover:bg-[#152035] border border-[#1e2c47] px-2.5 sm:px-3 py-1.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            Clear
          </button>
        </div>
      </header>

      {/* Real-time Progress Bar Overlay Banner when loading model weights */}
      {isModelLoading && (
        <div
          id="model-download-progress-banner"
          className="bg-[#091222]/95 border-b border-[#0284c7]/40 px-4 sm:px-6 py-2.5 transition-all animate-in fade-in slide-in-from-top-2 duration-200 z-10"
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-200 flex items-center gap-2 truncate pr-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38bdf8] shrink-0" />
                <span className="truncate">
                  {loadingStatusText ||
                    `Loading ${selectedModel.name} weights into browser cache...`}
                </span>
              </span>
              <span className="font-mono font-bold text-[#38bdf8] shrink-0">{loadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden p-0 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-indigo-500 rounded-full transition-all duration-200"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Cached in browser IndexedDB for zero-latency reload</span>
              <span>Target VRAM: ~{selectedModel.vram || selectedModel.size}</span>
            </div>
          </div>
        </div>
      )}

      {/* Container Layout with Drawer */}
      <div className="flex-1 flex overflow-hidden relative min-w-0">
        {/* Main Chat Scroll Container */}
        <div
          id="chat-messages-container"
          className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5 max-w-4xl w-full mx-auto"
        >
          {/* Render Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              {msg.role === "user" ? (
                /* User Message Bubble - aligned to right */
                <div className="flex justify-end">
                  <div
                    id={`user-message-${msg.id}`}
                    className="bg-[#121c2d] border border-[#20304a] text-slate-100 text-sm px-4 py-3 rounded-2xl max-w-lg shadow-sm leading-relaxed"
                  >
                    {msg.imageAttached && (
                      <img
                        src={msg.imageAttached}
                        alt="Attached"
                        className="rounded-lg max-h-48 mb-2 border border-slate-700 object-cover"
                      />
                    )}
                    {msg.webSearchUsed && (
                      <div className="inline-flex items-center gap-1 text-[10px] text-[#38bdf8] bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800/40 mb-1.5">
                        <Globe className="h-3 w-3" /> Google Search Grounding Active
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ) : (
                /* Assistant Message Card - Wide full container matching screenshot */
                <div
                  id={`assistant-message-${msg.id}`}
                  className="bg-[#0f1726] border border-[#1c293f] rounded-2xl p-4 text-slate-200 shadow-md space-y-3.5 text-sm leading-relaxed"
                >
                  {/* Mode Label */}
                  <div className="flex items-center justify-between">
                    {msg.modelUsed === "live-search-grounded" ||
                    (msg.sources && msg.sources.length > 0) ? (
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#38bdf8] bg-blue-950/70 px-2.5 py-1 rounded-lg border border-blue-800/50">
                        <Globe className="h-3.5 w-3.5 text-[#38bdf8]" />
                        <span>Live web result</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-[#121c2d] px-2.5 py-0.5 rounded-lg border border-[#1e2e47]">
                        <Lock className="h-3 w-3 text-emerald-400" />
                        <span>Local private response</span>
                      </div>
                    )}
                  </div>

                  <div className="prose prose-invert max-w-none text-slate-200 text-sm">
                    {/* Render content cleanly with markdown, LaTeX math, and code block syntax support */}
                    <MarkdownRenderer content={msg.content} onRunInSandbox={onOpenCodeSandbox} />
                  </div>

                  {/* Google Search Grounding Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-[#182438] space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#38bdf8]">
                        <Globe className="h-3.5 w-3.5 text-[#38bdf8]" />
                        <span>Google Search Grounding Sources</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, sIdx) => (
                          <a
                            key={sIdx}
                            href={source.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0a1220] hover:bg-[#14233a] border border-[#1d3354] hover:border-[#38bdf8]/60 text-[11px] text-slate-300 hover:text-white transition shadow-sm max-w-xs truncate"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                            <span className="truncate">{source.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Meta Footer: Speed tok/s & Rating actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#182438] text-xs text-slate-400">
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                      <span>
                        {msg.speedTokPerSec
                          ? `${msg.speedTokPerSec.toFixed(1)} tok/s`
                          : `${gpuStats.tokensPerSec.toFixed(1)} tok/s`}
                      </span>
                      <span>•</span>
                      <span>{msg.durationSec ? `${msg.durationSec.toFixed(1)}s` : "1.2s"}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        id={`thumbs-up-btn-${msg.id}`}
                        onClick={() => toggleThumbsUp(msg.id)}
                        title="Good response"
                        className={`p-1.5 rounded-lg transition ${
                          thumbsUpMap[msg.id]
                            ? "text-[#38bdf8] bg-blue-950/60"
                            : "text-slate-400 hover:text-slate-200 hover:bg-[#162238]"
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        id={`thumbs-down-btn-${msg.id}`}
                        onClick={() => toggleThumbsDown(msg.id)}
                        title="Poor response"
                        className={`p-1.5 rounded-lg transition ${
                          thumbsDownMap[msg.id]
                            ? "text-red-400 bg-red-950/60"
                            : "text-slate-400 hover:text-slate-200 hover:bg-[#162238]"
                        }`}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        id={`copy-msg-btn-${msg.id}`}
                        onClick={() => handleCopy(msg.id, msg.content)}
                        title="Copy response"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#162238] transition"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="h-3.5 w-3.5 text-green-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Live Streaming Message Box */}
          {isStreaming && (
            <div className="bg-[#0f1726] border border-[#1c293f] rounded-2xl p-4 text-slate-200 shadow-md space-y-3.5 text-sm">
              <div className="prose prose-invert max-w-none text-slate-200 text-sm">
                <MarkdownRenderer
                  content={streamingContent || "Thinking..."}
                  onRunInSandbox={onOpenCodeSandbox}
                />
                <span className="inline-block w-2 h-4 bg-[#38bdf8] ml-1 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] pt-2 border-t border-[#182438]">
                <RefreshCw className="h-3 w-3 animate-spin text-[#38bdf8]" />
                <span>Generating with WebGPU ({gpuStats.tokensPerSec.toFixed(1)} tok/s)...</span>
              </div>
            </div>
          )}

          {/* Quick Suggestion Chips & Live Previews matching screenshot 1 */}
          {messages.length <= 2 && !isStreaming && (
            <div className="space-y-4 pt-2">
              {/* Live Hardware Monitor & Code Sandbox Preview (Screenshot 1) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <HardwareMonitorCard stats={gpuStats} />
                <CodeSandboxCard
                  onOpenFullSandbox={() =>
                    onOpenCodeSandbox(
                      `// Example: Calculate factorial\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\nconsole.log(factorial(5));`,
                    )
                  }
                />
              </div>

              {/* Quick Suggestion Chips (2x2 Grid) matching screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    id={`suggestion-chip-${suggestion.replace(/\s+/g, "-").toLowerCase()}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-[#0e1626] hover:bg-[#162236] text-slate-300 hover:text-white border border-[#1c2a40] hover:border-[#2b3e5e] rounded-2xl px-4 py-3 text-xs font-medium text-center transition cursor-pointer shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Right Side Parameters & Telemetry Drawer (Toggled by Sliders Button) */}
        {showParamDrawer && (
          <aside
            id="chat-parameters-drawer"
            className="w-80 bg-[#070d17] border-l border-[#151f33] p-5 flex flex-col gap-5 shrink-0 overflow-y-auto animate-in slide-in-from-right-4 duration-200 z-30"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#151f33]">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-300">
                <Sliders className="w-4 h-4 text-[#38bdf8]" />
                <span>Model Parameters</span>
              </div>
              <button
                onClick={() => setShowParamDrawer(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#121c2d]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Model Status Card */}
            <div className="bg-[#0b1322] border border-[#16253c] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Model</span>
                <span className="font-semibold text-white">{selectedModel.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Memory Status</span>
                <span
                  className={`font-semibold ${
                    isCurrentModelLoaded ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {isCurrentModelLoaded ? "Loaded in VRAM" : "Not Loaded"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">VRAM Allocation</span>
                <span className="font-mono text-slate-200">
                  {selectedModel.vram || selectedModel.size}
                </span>
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Temperature</span>
                <span className="font-mono text-[#38bdf8] font-semibold">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#0284c7] bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Deterministic (0.0)</span>
                <span>Creative (1.5)</span>
              </div>
            </div>

            {/* Top-P Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Top-P Sampling</span>
                <span className="font-mono text-[#38bdf8] font-semibold">{topP}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="w-full accent-[#0284c7] bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Max Output Tokens */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Max Output Tokens</span>
                <span className="font-mono text-[#38bdf8] font-semibold">{maxTokens}</span>
              </div>
              <input
                type="range"
                min="128"
                max="4096"
                step="128"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-[#0284c7] bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <hr className="border-[#151f33]" />

            {/* WebGPU Hardware Stats */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>WebGPU Hardware</span>
              </div>
              <div className="space-y-1.5 text-slate-400 text-[11px]">
                <div className="flex justify-between">
                  <span>Adapter:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[160px]">
                    {gpuStats.deviceName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Backend:</span>
                  <span className="text-slate-200 font-mono">{gpuStats.backend}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated VRAM:</span>
                  <span className="text-slate-200 font-mono">
                    {gpuStats.memoryUsedGb} / {gpuStats.memoryTotalGb} GB
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy Badge */}
            <div className="mt-auto bg-[#0b1322] border border-[#16253c] rounded-xl p-3 text-xs space-y-1 text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400 text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Server Telemetry</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Weights run via WebGPU compute shaders. Prompts and conversations stay strictly in
                your browser session.
              </p>
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Input Area matching screenshot */}
      <div className="p-3 sm:p-4 md:px-8 pb-20 md:pb-4 max-w-4xl w-full mx-auto flex-shrink-0 z-10 space-y-2">
        {/* Search Grounding Banner matching Screenshot 3 */}
        {showSearchGroundingBanner && (
          <div className="flex justify-start">
            <SearchGroundingBanner
              enabled={webSearchActive}
              onToggle={(active) => setWebSearchActive(active)}
              onDismiss={() => setShowSearchGroundingBanner(false)}
            />
          </div>
        )}

        <div
          id="chat-input-card"
          className="bg-[#0e1626] border border-[#1c2a40] rounded-2xl p-2.5 sm:p-3 shadow-2xl space-y-2.5"
        >
          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="relative inline-block">
              <img
                src={attachedImage}
                alt="Upload preview"
                className="h-14 w-14 sm:h-16 sm:w-16 object-cover rounded-xl border border-[#2b3e5e]"
              />
              <button
                onClick={() => setAttachedImage(null)}
                className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Prompt Input Row */}
          <div className="flex items-center gap-2">
            <textarea
              ref={textareaRef}
              id="chat-prompt-textarea"
              rows={1}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-sm outline-none resize-none px-1 py-1 max-h-28 overflow-y-auto"
            />
            <button
              id="send-message-button"
              onClick={handleSend}
              disabled={(!inputText.trim() && !attachedImage) || isStreaming}
              className={`p-2 sm:p-2.5 rounded-xl transition flex items-center justify-center flex-shrink-0 ${
                (inputText.trim() || attachedImage) && !isStreaming
                  ? "bg-[#1d4ed8] hover:bg-[#2563eb] text-white shadow-md cursor-pointer active:scale-95"
                  : "bg-[#141f33] text-slate-500 cursor-not-allowed"
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom Toolbar Icons matching screenshot */}
          <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-[#162238]/60">
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Insert Code Block Button */}
              <button
                id="btn-insert-code"
                onClick={handleInsertCodeTemplate}
                title="Insert Code Snippet / Template"
                className="p-1.5 rounded-lg bg-[#121c2d] hover:bg-[#1a2840] text-slate-300 hover:text-[#38bdf8] border border-[#1e2d45] transition text-xs flex items-center gap-1 cursor-pointer"
              >
                <FileCode className="h-3.5 w-3.5" />
              </button>

              {/* Code Sandbox Quick Launcher Button */}
              <button
                id="btn-open-code-sandbox"
                onClick={() => onOpenCodeSandbox(inputText)}
                title="Run in Code Sandbox"
                className="p-1.5 rounded-lg bg-[#121c2d] hover:bg-[#1a2840] text-[#38bdf8] hover:text-white border border-[#1e2d45] hover:border-[#38bdf8]/50 transition text-xs flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Terminal className="h-3.5 w-3.5 text-[#38bdf8]" />
              </button>

              {/* Google Search Grounding Button */}
              <button
                id="btn-toggle-web-search"
                onClick={() => setWebSearchActive(!webSearchActive)}
                title={
                  webSearchActive
                    ? "Google Search Grounding: ON (Click to disable)"
                    : "Google Search Grounding: OFF (Click to enable live web search)"
                }
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  webSearchActive
                    ? "bg-blue-900/60 text-[#38bdf8] border-blue-500/50"
                    : "bg-[#121c2d] hover:bg-[#1a2840] text-slate-300 hover:text-white border-[#1e2d45]"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
              </button>

              {/* Image Upload Button */}
              <button
                id="btn-attach-image"
                onClick={() => fileInputRef.current?.click()}
                title="Attach image for local vision analysis"
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  attachedImage
                    ? "bg-purple-900/60 text-purple-300 border-purple-500/50"
                    : "bg-[#121c2d] hover:bg-[#1a2840] text-slate-300 hover:text-white border-[#1e2d45]"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
              <span className="hidden xs:inline">Press </span>
              <kbd className="px-1 py-0.5 bg-[#141f33] rounded text-slate-300 text-[10px]">
                Enter ↵
              </kbd>{" "}
              <span className="hidden xs:inline">to send</span>
            </div>
          </div>
        </div>

        {/* Security Notice matching screenshot bottom */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] sm:text-xs text-slate-400 select-none text-center">
          <Lock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <span>All responses are generated locally on your device.</span>
        </div>
      </div>
    </div>
  );
};
