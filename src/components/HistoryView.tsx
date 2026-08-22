import React, { useState } from "react";
import {
  History as HistoryIcon,
  Search,
  Trash2,
  Download,
  MessageSquare,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { Conversation, ChatMessage } from "@/types";

interface HistoryViewProps {
  conversations: Conversation[];
  onLoadConversation: (conv: Conversation) => void;
  onDeleteConversation: (id: string) => void;
  onClearAllHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  conversations,
  onLoadConversation,
  onDeleteConversation,
  onClearAllHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.messages.some((m) => m.content.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const exportAsJson = (conv: Conversation) => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(conv, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `broai-session-${conv.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportAsMarkdown = (conv: Conversation) => {
    let md = `# ${conv.title}\n\n*Created on ${new Date(conv.createdAt).toLocaleString()} via BroAI*\n\n---\n\n`;
    conv.messages.forEach((m) => {
      md += `### ${m.role === "user" ? "User" : "BroAI Assistant"}\n${m.content}\n\n`;
    });

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `broai-session-${conv.id}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#090d16] text-slate-100 overflow-y-auto font-sans p-3 sm:p-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#151f33] max-w-5xl mx-auto w-full gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-[#38bdf8]" />
            Conversation Archives
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Locally stored sessions encrypted in your browser's IndexedDB / localStorage.
          </p>
        </div>
        {conversations.length > 0 && (
          <button
            onClick={onClearAllHistory}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs border border-red-800/40 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear All History
          </button>
        )}
      </div>

      <div className="max-w-5xl mx-auto w-full mt-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search past prompts, answers, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0e1626] border border-[#1c2a40] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-[#38bdf8]"
          />
        </div>

        {/* Conversation List */}
        {filteredConversations.length === 0 ? (
          <div className="bg-[#0e1626] border border-[#1c2a40] rounded-2xl p-12 text-center text-slate-400 text-xs space-y-2">
            <MessageSquare className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <div className="font-semibold text-slate-300">No conversations found</div>
            <div>Start asking questions in the Chat tab to build your private local history.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="bg-[#0e1626] border border-[#1c2a40] hover:border-[#2b3e5e] rounded-2xl p-4 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{conv.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#131f33] text-[#38bdf8] border border-[#203252]">
                      {conv.modelId}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      {new Date(conv.createdAt).toLocaleDateString()} at{" "}
                      {new Date(conv.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>•</span>
                    <span className="text-[11px]">{conv.messages.length} messages</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 italic">
                    "{conv.messages[conv.messages.length - 1]?.content || ""}"
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onLoadConversation(conv)}
                    className="px-3 py-1.5 rounded-xl bg-[#1d4ed8] hover:bg-[#2563eb] text-white text-xs font-medium flex items-center gap-1 transition shadow"
                  >
                    Open <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => exportAsMarkdown(conv)}
                    title="Export as Markdown"
                    className="p-2 rounded-xl bg-[#121c2d] hover:bg-[#18263d] text-slate-300 hover:text-white border border-[#1d2c44] transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteConversation(conv.id)}
                    title="Delete session"
                    className="p-2 rounded-xl bg-[#121c2d] hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-[#1d2c44] transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
