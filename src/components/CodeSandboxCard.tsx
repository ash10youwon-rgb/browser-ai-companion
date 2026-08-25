import React, { useState } from "react";
import { Play, Check, ShieldCheck } from "lucide-react";
import { runIsolatedJavaScript } from "@/lib/isolatedSandboxRunner";

interface CodeSandboxCardProps {
  initialCode?: string;
  onOpenFullSandbox?: () => void;
  className?: string;
}

export const CodeSandboxCard: React.FC<CodeSandboxCardProps> = ({
  initialCode = `// Example: Calculate factorial
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5));`,
  onOpenFullSandbox,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"index.js" | "Output">("index.js");
  const [code, setCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<string>("120");
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(2);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const result = await runIsolatedJavaScript(code, 3000);
      setExecutionTimeMs(result.durationMs);
      if (result.error) {
        setOutput(`Error: ${result.error}`);
      } else {
        const text = result.logs.map((l) => l.message).join("\n");
        setOutput(text.length > 0 ? text : "(Code executed with no output)");
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setOutput(`Error: ${errorObj?.message || String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div
      id="code-sandbox-preview-card"
      className={`bg-[#050b14] border border-[#0284c7]/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between font-sans ${className}`}
    >
      {/* Title Header */}
      <div className="text-xs font-bold tracking-wider text-[#38bdf8] uppercase mb-3 flex items-center justify-between">
        <span>CODE SANDBOX PREVIEW</span>
        {onOpenFullSandbox && (
          <button
            onClick={onOpenFullSandbox}
            className="text-[10px] text-slate-400 hover:text-[#38bdf8] transition underline lowercase"
          >
            open full editor
          </button>
        )}
      </div>

      {/* Code Editor & Output split container matching screenshot */}
      <div className="bg-[#08111e] border border-[#14233a] rounded-xl overflow-hidden flex flex-col flex-1">
        {/* Top Header Tabs */}
        <div className="bg-[#0b1626] border-b border-[#14233a] px-2 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("index.js")}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium transition cursor-pointer ${
                activeTab === "index.js"
                  ? "bg-[#14253f] text-slate-100 border border-[#233f6a]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              index.js
            </button>
            <button
              onClick={() => setActiveTab("Output")}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium transition cursor-pointer ${
                activeTab === "Output"
                  ? "bg-[#14253f] text-slate-100 border border-[#233f6a]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Output
            </button>
          </div>
          <span className="text-[10px] font-mono text-slate-400 pr-2">Output</span>
        </div>

        {/* Editor & Output split area */}
        <div className="grid grid-cols-12 flex-1 min-h-[140px] text-xs font-mono">
          {/* Left code editor */}
          <div className="col-span-8 p-3 bg-[#070e1a] border-r border-[#122035] overflow-y-auto scrollbar-thin scrollbar-thumb-[#1e3458] scrollbar-track-transparent">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full min-h-[110px] bg-transparent text-slate-200 outline-none resize-none font-mono text-[11px] leading-relaxed selection:bg-[#0284c7]/40 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              spellCheck={false}
            />
          </div>

          {/* Right output pane */}
          <div className="col-span-4 p-3 bg-[#060b14] overflow-y-auto text-[11px] font-mono text-slate-100 flex flex-col justify-start scrollbar-thin scrollbar-thumb-[#1e3458] scrollbar-track-transparent">
            <div className="text-slate-100 font-bold whitespace-pre-wrap">{output}</div>
          </div>
        </div>

        {/* Bottom Run Code Bar */}
        <div className="bg-[#070e1a] border-t border-[#122035] p-2.5 flex items-center justify-between">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-3.5 py-1.5 rounded-lg bg-[#1e40af] hover:bg-[#1d4ed8] active:scale-95 text-white font-medium text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <span>Run Code</span>
            <Play className="h-3 w-3 fill-current" />
          </button>

          <div className="flex items-center gap-1.5 text-xs text-[#22c55e] font-medium">
            <span>Success</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-slate-300">{executionTimeMs}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
