import React from "react";
import {
  Settings as SettingsIcon,
  Sliders,
  ShieldCheck,
  Cpu,
  Volume2,
  Save,
  RotateCcw,
} from "lucide-react";
import { AppSettings, WebGpuStats } from "@/types";
import { INITIAL_SETTINGS } from "@/data/mockData";

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  gpuStats: WebGpuStats;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  gpuStats,
}) => {
  const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleReset = () => {
    onUpdateSettings(INITIAL_SETTINGS);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#090d16] text-slate-100 overflow-y-auto font-sans p-3 sm:p-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#151f33] max-w-4xl mx-auto w-full gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-[#38bdf8]" />
            BroAI Settings & Hardware Preferences
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure WebGPU shader execution, inference parameters, and local data persistence.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121c2d] hover:bg-[#18263d] text-slate-300 text-xs border border-[#1d2c44] transition cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Defaults
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6 mt-6 pb-12">
        {/* Inference Controls Card */}
        <div className="bg-[#0e1626] border border-[#1c2a40] rounded-2xl p-5 space-y-4 shadow-md">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#38bdf8]" />
            Inference Parameters
          </h2>

          {/* Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <label htmlFor="setting-temperature">Temperature (Creativity vs. Determinism)</label>
              <span className="font-mono text-[#38bdf8] font-semibold">{settings.temperature}</span>
            </div>
            <input
              id="setting-temperature"
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={settings.temperature}
              onChange={(e) => handleChange("temperature", parseFloat(e.target.value))}
              className="w-full accent-[#38bdf8]"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.1 (Strict & Precise)</span>
              <span>1.5 (Creative & Freeform)</span>
            </div>
          </div>

          {/* Top-P Nucleus Sampling */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-300">
              <label htmlFor="setting-top-p">Top-P (Nucleus Sampling)</label>
              <span className="font-mono text-[#38bdf8] font-semibold">{settings.topP}</span>
            </div>
            <input
              id="setting-top-p"
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.topP}
              onChange={(e) => handleChange("topP", parseFloat(e.target.value))}
              className="w-full accent-[#38bdf8]"
            />
          </div>

          {/* Max Output Tokens */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-300">
              <label htmlFor="setting-max-tokens">Max Output Tokens per Generation</label>
              <span className="font-mono text-[#38bdf8] font-semibold">{settings.maxTokens}</span>
            </div>
            <input
              id="setting-max-tokens"
              type="range"
              min="256"
              max="8192"
              step="256"
              value={settings.maxTokens}
              onChange={(e) => handleChange("maxTokens", parseInt(e.target.value))}
              className="w-full accent-[#38bdf8]"
            />
          </div>

          {/* Streaming Smoothness */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-300">
              <label htmlFor="setting-stream-speed">Streaming Fluidity</label>
              <span className="font-mono text-[#38bdf8] font-semibold">
                {settings.streamingSpeed}%
              </span>
            </div>
            <input
              id="setting-stream-speed"
              type="range"
              min="0"
              max="100"
              value={settings.streamingSpeed}
              onChange={(e) => handleChange("streamingSpeed", parseInt(e.target.value))}
              className="w-full accent-[#38bdf8]"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (Instant Burst)</span>
              <span>100% (Ultra-Smooth Token Flow)</span>
            </div>
          </div>
        </div>

        {/* System Prompt Customizer */}
        <div className="bg-[#0e1626] border border-[#1c2a40] rounded-2xl p-5 space-y-3 shadow-md">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#38bdf8]" />
            Default System Prompt
          </h2>
          <p className="text-xs text-slate-400">
            Customize the baseline personality, behavioral constraints, and instructions injected
            into each local session.
          </p>
          <textarea
            id="setting-system-prompt"
            rows={3}
            value={settings.systemPrompt}
            onChange={(e) => handleChange("systemPrompt", e.target.value)}
            className="w-full bg-[#080d16] border border-[#1b283f] rounded-xl p-3 text-xs text-slate-100 outline-none focus:border-[#38bdf8] leading-relaxed resize-none"
          />
        </div>

        {/* Hardware & WebGPU Diagnostics Card */}
        <div className="bg-[#0e1626] border border-[#1c2a40] rounded-2xl p-5 space-y-4 shadow-md">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#38bdf8]" />
            WebGPU Hardware Diagnostics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0a101b] border border-[#18253a] space-y-1">
              <div className="text-slate-400 text-[11px]">Active Graphics Adapter</div>
              <div className="text-slate-200 font-medium">{gpuStats.deviceName}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0a101b] border border-[#18253a] space-y-1">
              <div className="text-slate-400 text-[11px]">Shader Compilation Engine</div>
              <div className="text-slate-200 font-medium">{gpuStats.driverVersion}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0a101b] border border-[#18253a] space-y-1">
              <div className="text-slate-400 text-[11px]">Backend API Target</div>
              <div className="text-slate-200 font-medium">{gpuStats.backend}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0a101b] border border-[#18253a] space-y-1">
              <div className="text-slate-400 text-[11px]">Privacy Assurance</div>
              <div className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>0 Bytes Network
                Egress (100% Offline)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
