import React, { useState } from "react";
import {
  MessageSquare,
  Image as ImageIcon,
  Cpu,
  CodeXml,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Info,
  Plus,
  Trash2,
  ChevronDown,
  MessageSquarePlus,
  X,
} from "lucide-react";
import { TabType, WebGpuStats, Conversation } from "@/types";
import { BroAiLogo } from "./BroAiLogo";

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  gpuStats: WebGpuStats;
  onNewChat: () => void;
  conversations?: Conversation[];
  activeConversationId?: string;
  onSelectConversation?: (conv: Conversation) => void;
  onDeleteConversation?: (id: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  gpuStats,
  onNewChat,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [showRecentChats, setShowRecentChats] = useState(true);

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "chat", label: "Chat", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "image-lab", label: "Image Lab", icon: <ImageIcon className="h-4 w-4" /> },
    { id: "models", label: "Models", icon: <Cpu className="h-4 w-4" /> },
    { id: "code-sandbox", label: "Code Sandbox", icon: <CodeXml className="h-4 w-4" /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon className="h-4 w-4" /> },
    { id: "history", label: "History", icon: <HistoryIcon className="h-4 w-4" /> },
    { id: "about", label: "About", icon: <Info className="h-4 w-4" /> },
  ];

  const handleTabClick = (tabId: TabType) => {
    onSelectTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const handleNewChatClick = () => {
    onNewChat();
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectConvClick = (conv: Conversation) => {
    if (onSelectConversation) onSelectConversation(conv);
    if (onCloseMobile) onCloseMobile();
  };

  // Reusable Sidebar Content Inner
  const sidebarContent = (
    <div className="flex flex-col justify-between h-full select-none font-sans overflow-hidden">
      {/* Top Section */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <BroAiLogo size={28} />
            <span className="text-xl font-bold tracking-tight text-white flex items-center">
              Bro<span className="text-[#38bdf8]">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full font-semibold">
              Local GPU
            </span>
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121b2d] transition"
                title="Close Sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Primary "+ New Chat" Action Button */}
        <div className="px-3 pt-2 pb-1">
          <button
            id="sidebar-new-chat-button"
            onClick={handleNewChatClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-[#0ea5e9] hover:opacity-95 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(56,189,248,0.35)] transition cursor-pointer active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-0.5 px-2.5 mt-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? "bg-[#132037] text-white shadow-sm border border-[#233555]/80 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#0e1626]"
                }`}
              >
                <span className={`${isActive ? "text-[#38bdf8]" : "text-slate-400"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Recent Chats Section */}
        {conversations.length > 0 && (
          <div className="px-2.5 mt-4 pt-3 border-t border-[#131e33] flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between px-2 pb-1.5">
              <button
                onClick={() => setShowRecentChats(!showRecentChats)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-200 tracking-wider uppercase transition cursor-pointer"
              >
                <span>Recent Chats</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${showRecentChats ? "" : "-rotate-90"}`}
                />
              </button>
              <button
                onClick={handleNewChatClick}
                title="Start a new chat session"
                className="p-1 rounded-md text-slate-400 hover:text-[#38bdf8] hover:bg-[#101b2e] transition"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
              </button>
            </div>

            {showRecentChats && (
              <div className="space-y-0.5 overflow-y-auto max-h-48 pr-1 mt-1 scrollbar-thin">
                {conversations.slice(0, 10).map((conv) => {
                  const isActive = currentTab === "chat" && activeConversationId === conv.id;
                  return (
                    <div
                      key={conv.id}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                        isActive
                          ? "bg-[#101e35] text-[#38bdf8] font-medium border border-[#1b3154]"
                          : "text-slate-400 hover:text-slate-200 hover:bg-[#0c1424]"
                      }`}
                      onClick={() => handleSelectConvClick(conv)}
                    >
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
                        <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                        <span className="truncate text-[11px]">
                          {conv.title || "Untitled Chat"}
                        </span>
                      </div>

                      {onDeleteConversation && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          title="Delete this chat"
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition rounded hover:bg-red-950/40"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom WebGPU Card */}
      <div className="p-2.5 border-t border-[#131e33] flex-shrink-0">
        <div
          id="webgpu-status-card"
          className="bg-[#0b1322] border border-[#17253d] rounded-2xl p-3 space-y-2.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white tracking-tight">WebGPU Engine</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#064e3b]/40 text-[#34d399] border border-[#059669]/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
              Active
            </span>
          </div>

          {/* Stats Rows */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">VRAM</span>
              <span className="text-slate-100 font-mono">
                {gpuStats.memoryUsedGb.toFixed(1)} / {gpuStats.memoryTotalGb.toFixed(1)} GB
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Inference</span>
              <span className="text-slate-100 font-mono">
                {gpuStats.tokensPerSec.toFixed(1)} tok/s
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Temp</span>
              <span className="text-slate-100 font-mono">{gpuStats.temperatureC}°C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        id="app-sidebar-desktop"
        className="hidden md:flex flex-col w-64 flex-shrink-0 bg-[#070b12] border-r border-[#151f33] h-screen select-none font-sans overflow-hidden z-20"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Slide-in Drawer */}
          <aside
            id="app-sidebar-mobile"
            className="relative z-50 w-72 max-w-[85vw] bg-[#070b12] border-r border-[#151f33] h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-left duration-200"
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
