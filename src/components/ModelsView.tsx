import React, { useState } from "react";
import {
  Cpu,
  Check,
  Play,
  Zap,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  Layers,
  Download,
  Loader2,
} from "lucide-react";
import { ModelInfo, WebGpuStats } from "@/types";
import { isModelLoadedInVRAM, preloadModelInVRAM } from "@/services/browserLLMEngine";

interface ModelsViewProps {
  models: ModelInfo[];
  selectedModel: ModelInfo;
  onSelectModel: (model: ModelInfo) => void;
  onLoadModel: (modelId: string) => void;
  gpuStats: WebGpuStats;
}

export const ModelsView: React.FC<ModelsViewProps> = ({
  models,
  selectedModel,
  onSelectModel,
  onLoadModel,
  gpuStats,
}) => {
  const [loadingModelId, setLoadingModelId] = useState<string | null>(null);
  const [loadingStatusText, setLoadingStatusText] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    "Micro & Instant Models",
    "Fast & Light Models",
    "Mid & Logic Models",
    "Flagship & Reasoning Models",
  ];

  const filteredModels =
    selectedCategory === "All" ? models : models.filter((m) => m.category === selectedCategory);

  const handleSwitchModel = async (model: ModelInfo) => {
    setLoadingModelId(model.id);
    setLoadingStatusText(`Connecting shaders for ${model.name}...`);

    try {
      await preloadModelInVRAM(model.id, (pct, status) => {
        setLoadingStatusText(status || `Loading (${pct}%)...`);
      });
      onLoadModel(model.id);
      onSelectModel({ ...model, loaded: true });
    } catch (err) {
      console.warn("Model preload fallback:", err);
      onLoadModel(model.id);
      onSelectModel(model);
    } finally {
      setLoadingModelId(null);
      setLoadingStatusText("");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#090d16] text-slate-100 overflow-y-auto font-sans p-3 sm:p-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#151f33] max-w-6xl mx-auto w-full gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#38bdf8]" />
            Local Model Hub
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Open-weights models compiled to WebGPU shaders (WGSL). Run 100% offline in browser cache
            with zero server latency.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full text-xs font-mono bg-[#0b1322] border border-[#1b2942] text-slate-300 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            VRAM: {gpuStats.memoryUsedGb} / {gpuStats.memoryTotalGb} GB
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none flex-nowrap sm:flex-wrap -mx-1 px-1 max-w-6xl mx-auto w-full mt-4">
        {categories.map((cat) => {
          const count =
            cat === "All" ? models.length : models.filter((m) => m.category === cat).length;
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                isActive
                  ? "bg-[#0284c7] text-white shadow-md font-semibold"
                  : "bg-[#0e1728] text-slate-400 hover:text-slate-200 hover:bg-[#15233c] border border-[#1a2b46]"
              }`}
            >
              {cat === "All" ? <Layers className="h-3 w-3" /> : null}
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-white/20 text-white" : "bg-[#16233b] text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto w-full mt-6 pb-8">
        {filteredModels.map((model) => {
          const isSelected = selectedModel.id === model.id;
          const isLoading = loadingModelId === model.id;
          const isModelLoaded = model.loaded || isModelLoadedInVRAM(model.id);

          return (
            <div
              key={model.id}
              className={`bg-[#0e1626] rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-[#38bdf8]/60 ring-1 ring-[#38bdf8]/40 shadow-lg shadow-blue-950/30"
                  : "border-[#1b283f] hover:border-[#2a3f63]"
              }`}
            >
              <div>
                {/* Top Badge & Family */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-[#38bdf8] bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                    {model.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isModelLoaded && !isSelected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Cached in VRAM
                      </span>
                    )}
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white mb-1">{model.name}</h3>
                <div className="text-[11px] font-mono text-slate-400 mb-2">
                  {model.dropdownLabel}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{model.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {model.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-[#131e30] border border-[#1e2e48] text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Specs List */}
                <div className="space-y-1.5 border-t border-[#162338] pt-3 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3 text-slate-500" /> Model Size:
                    </span>
                    <span className="font-mono text-slate-200">{model.size}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-400" /> Est. Speed:
                    </span>
                    <span className="font-mono text-[#38bdf8] font-semibold">{model.speed}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Quantization:</span>
                    <span className="font-mono text-slate-300">{model.quantization}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Context Window:</span>
                    <span className="font-mono text-slate-300">{model.contextWindow} tokens</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-[#162338]">
                {isSelected ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl text-xs font-medium bg-[#14233c] text-[#38bdf8] border border-[#23385c] flex items-center justify-center gap-1.5 cursor-default"
                  >
                    <Check className="h-3.5 w-3.5" /> Currently Loaded
                  </button>
                ) : (
                  <button
                    onClick={() => handleSwitchModel(model)}
                    disabled={isLoading}
                    className="w-full py-2 rounded-xl text-xs font-medium bg-[#1d4ed8] hover:bg-[#2563eb] text-white flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                        <span className="truncate">
                          {loadingStatusText || "Transferring weights to WebGPU..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" /> Load into GPU Memory
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
