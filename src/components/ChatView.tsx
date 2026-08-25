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
} from "lucide-react";
import { ChatMessage, ModelInfo, WebGpuStats } from "@/types";
import { QUICK_SUGGESTIONS, KNOWLEDGE_BASE_RESPONSES } from "@/data/mockData";
import { HardwareMonitorCard } from "./HardwareMonitorCard";
import { CodeSandboxCard } from "./CodeSandboxCard";
import { SearchGroundingBanner } from "./SearchGroundingBanner";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ChatViewProps {
  messages: ChatMessage[];
  models: ModelInfo[];
  selectedModel: ModelInfo;
  onSelectModel: (model: ModelInfo) => void;
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      <header className="h-14 border-b border-[#151f33] px-3 sm:px-6 flex items-center justify-between bg-[#080d17]/80 backdrop-blur-sm z-20 flex-shrink-0">
        {/* Left Side: Mobile Menu Button + Model Selector Dropdown */}
        <div className="flex items-center gap-1.5">
          {onToggleMobileMenu && (
            <button
              id="mobile-sidebar-toggle-btn"
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 -ml-1 rounded-xl text-slate-300 hover:text-white hover:bg-[#121b2d] transition cursor-pointer"
              title="Open Navigation"
              aria-label="Open Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Model Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="model-selector-dropdown-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-slate-300 hover:text-white transition group py-1.5 px-2 rounded-lg hover:bg-[#121b2d] cursor-pointer"
            >
              <span className="hidden xs:inline">Chat with</span>
              <span className="font-semibold text-white group-hover:text-[#38bdf8] transition max-w-[130px] xs:max-w-[180px] sm:max-w-[240px] md:max-w-none truncate">
                {selectedModel.name}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180 text-[#38bdf8]" : ""
                }`}
              />
            </button>

            {/* Model Switcher Dropdown Menu */}
            {isDropdownOpen && (
              <div
                id="model-dropdown-menu"
                className="absolute left-0 top-full mt-1.5 w-[calc(100vw-32px)] max-w-sm bg-[#070e1b] border border-[#1a2942] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
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
                            return (
                              <button
                                key={model.id}
                                id={`select-model-${model.id}`}
                                onClick={() => {
                                  onSelectModel(model);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs transition cursor-pointer ${
                                  isSelected
                                    ? "bg-[#0284c7] text-white font-semibold shadow-sm"
                                    : "text-slate-200 hover:bg-[#121f35] hover:text-white"
                                }`}
                              >
                                <span className="truncate pr-2">
                                  {model.dropdownLabel || model.name}
                                </span>
                                {isSelected && (
                                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-white" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-[#16233b] bg-[#050b16] py-2 px-3 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {models.length} WebGPU models available
                  </span>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenModelModal();
                    }}
                    className="text-xs text-[#38bdf8] hover:underline font-medium cursor-pointer"
                  >
                    Manage Hub →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {activeChatTitle && (
            <span className="hidden lg:inline-block max-w-[180px] truncate text-xs text-slate-400 font-medium px-2.5 py-1 rounded-lg bg-[#0b1322] border border-[#16253c]">
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
            <span className="hidden xs:inline">New Chat</span>
          </button>

          {/* Clear Chat Button */}
          <button
            id="clear-chat-button"
            onClick={onClearChat}
            className="text-xs font-medium text-slate-300 hover:text-white bg-[#0e1626] hover:bg-[#152035] border border-[#1e2c47] px-2.5 sm:px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            Clear
          </button>
        </div>
      </header>

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
