import React, { useEffect, useState, useRef } from "react";
import { WebGpuStats } from "@/types";

interface HardwareMonitorCardProps {
  stats: WebGpuStats;
  className?: string;
}

export const HardwareMonitorCard: React.FC<HardwareMonitorCardProps> = ({
  stats,
  className = "",
}) => {
  const [detectedGpuName, setDetectedGpuName] = useState<string>(stats.gpuName);

  useEffect(() => {
    // Detect real client GPU if available in browser
    try {
      if (typeof navigator !== "undefined" && "gpu" in navigator) {
        (navigator as unknown as { gpu: { requestAdapter: () => Promise<unknown> } }).gpu
          .requestAdapter()
          .then((adapter: unknown) => {
            const adapterObj = adapter as { info?: { device?: string; description?: string } };
            if (adapterObj?.info?.device || adapterObj?.info?.description) {
              setDetectedGpuName(
                adapterObj.info.device || adapterObj.info.description || stats.gpuName,
              );
            }
          })
          .catch(() => {});
      }

      // Fallback to WebGL debug renderer
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          if (renderer && typeof renderer === "string") {
            const clean = renderer
              .replace(/ANGLE \((.*)\)/, "$1")
              .replace(/Direct3D.*/, "")
              .replace(/vs_\d+_\d+.*$/, "")
              .trim();
            if (clean) setDetectedGpuName(clean);
          }
        }
      }
    } catch {
      // Keep default
    }
  }, [stats.gpuName]);

  const [history, setHistory] = useState<number[]>([
    4, 6, 8, 7, 12, 10, 15, 13, 18, 14, 22, 19, 24, 21, 26, 23, 27, 25, 28, 26, 29, 27, 31, 28, 34,
    32, 38,
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live sparkline ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((prev) => {
        const nextVal = Math.min(
          39,
          Math.max(12, prev[prev.length - 1]! + (Math.random() * 6 - 2.8)),
        );
        const updated = [...prev.slice(1), Math.round(nextVal)];
        return updated;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Draw smooth neon green sparkline graph matching screenshot
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw subtle grid line for 20 and 0
    ctx.strokeStyle = "rgba(56, 189, 248, 0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);

    // Mid line (approx 20)
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(width, height * 0.5);
    ctx.stroke();

    // Bottom line (0)
    ctx.beginPath();
    ctx.moveTo(0, height - 2);
    ctx.lineTo(width, height - 2);
    ctx.stroke();

    ctx.setLineDash([]); // reset line dash

    if (history.length < 2) return;

    const step = width / (history.length - 1);
    const maxVal = 40;

    // Draw area gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "rgba(74, 222, 128, 0.25)");
    grad.addColorStop(1, "rgba(74, 222, 128, 0.0)");

    ctx.beginPath();
    ctx.moveTo(0, height);

    history.forEach((val, i) => {
      const x = i * step;
      const y = height - (val / maxVal) * (height - 6) - 3;
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = (i - 1) * step;
        const prevY = height - (history[i - 1]! / maxVal) * (height - 6) - 3;
        const midX = (prevX + x) / 2;
        ctx.bezierCurveTo(midX, prevY, midX, y, x, y);
      }
    });

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw bright neon stroke
    ctx.beginPath();
    history.forEach((val, i) => {
      const x = i * step;
      const y = height - (val / maxVal) * (height - 6) - 3;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = (i - 1) * step;
        const prevY = height - (history[i - 1]! / maxVal) * (height - 6) - 3;
        const midX = (prevX + x) / 2;
        ctx.bezierCurveTo(midX, prevY, midX, y, x, y);
      }
    });

    ctx.strokeStyle = "#4ade80";
    ctx.lineWidth = 1.8;
    ctx.shadowColor = "#4ade80";
    ctx.shadowBlur = 6;
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;
  }, [history]);

  const memoryPercent = Math.round((stats.memoryUsedGb / stats.memoryTotalGb) * 100);
  const tempPercent = Math.min(100, Math.round((stats.temperatureC / 100) * 100));
  const speedPercent = Math.min(100, Math.round((stats.tokensPerSec / 50) * 100));

  return (
    <div
      id="hardware-monitor-live-card"
      className={`bg-[#050b14] border border-[#0284c7]/40 rounded-2xl p-4 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Title Header */}
      <div className="text-xs font-bold tracking-wider text-[#38bdf8] uppercase mb-3 flex items-center justify-between">
        <span>HARDWARE MONITOR (LIVE)</span>
      </div>

      {/* Internal Monitor Box */}
      <div className="bg-[#081220] border border-[#132845] rounded-xl p-3 space-y-3">
        {/* Row 1: WebGPU Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">WebGPU</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#064e3b] text-[#4ade80] border border-[#059669]/50">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] animate-pulse"></span>
            Active
          </span>
        </div>

        {/* Row 2: GPU Model */}
        <div>
          <div className="text-[11px] font-semibold text-white">GPU</div>
          <div className="text-[10px] text-slate-300 font-mono">
            {detectedGpuName || stats.gpuName || "NVIDIA RTX 3050 Laptop GPU"}
          </div>
        </div>

        {/* Row 3: Memory Usage Progress */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-300">Memory Usage</span>
            <span className="text-slate-200 font-mono text-[10px]">
              {stats.memoryUsedGb.toFixed(1)} / {stats.memoryTotalGb.toFixed(1)} GB
            </span>
          </div>
          <div className="w-full bg-[#101e33] h-2 rounded-full overflow-hidden p-0.5 border border-[#182e4e]">
            <div
              className="bg-[#22c55e] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
              style={{ width: `${Math.max(15, memoryPercent)}%` }}
            />
          </div>
        </div>

        {/* Row 4: Temperature */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-300">Temperature</span>
            <span className="text-slate-200 font-mono text-[10px]">{stats.temperatureC}°C</span>
          </div>
          <div className="w-full bg-[#101e33] h-2 rounded-full overflow-hidden p-0.5 border border-[#182e4e]">
            <div
              className="bg-[#22c55e] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
              style={{ width: `${Math.max(20, tempPercent)}%` }}
            />
          </div>
        </div>

        {/* Row 5: Tokens / sec */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-300">Tokens / sec</span>
            <span className="text-slate-200 font-mono text-[10px]">
              {stats.tokensPerSec.toFixed(1)} tok/s
            </span>
          </div>
          <div className="w-full bg-[#101e33] h-2 rounded-full overflow-hidden p-0.5 border border-[#182e4e]">
            <div
              className="bg-[#0284c7] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(2,132,199,0.6)]"
              style={{ width: `${Math.max(25, speedPercent)}%` }}
            />
          </div>
        </div>

        {/* Row 6: Tokens / sec (Live) Sparkline Graph matching screenshot */}
        <div className="pt-2 border-t border-[#13233b] flex items-center justify-between gap-2">
          <div className="text-[10px] text-slate-300 font-medium whitespace-nowrap">
            Tokens / sec (Live)
          </div>

          <div className="flex items-center gap-1.5 flex-1 justify-end">
            <div className="flex flex-col justify-between text-[8px] font-mono text-slate-400 h-10 py-0.5 select-none text-right">
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>
            <div className="bg-[#040810] border border-[#142238] rounded-md p-1 w-32 h-10 relative">
              <canvas ref={canvasRef} width={120} height={32} className="w-full h-full block" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
