import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Download,
  RefreshCw,
  Wand2,
  Sliders,
  Layers,
  Image as ImageIcon,
  Check,
  Maximize2,
  Dice5,
  Zap,
  Upload,
  Crop,
  Eye,
  Camera,
  SplitSquareVertical,
  Cpu,
  Copy,
  ExternalLink,
  ShieldCheck,
  Globe,
  Volume2,
  AlertCircle,
  HardDrive,
  Trash2,
  X,
} from "lucide-react";
import { WebGpuStats } from "@/types";
import { TransformersShowcase } from "./TransformersShowcase";
import {
  generateSmartImage,
  initSmartImageEngine,
  exportModelCache,
  downloadModelCache,
  importModelCache,
  getModelCacheSize,
  clearModelCache,
  type SmartImageBackend,
} from "@/services/imageGeneration";
import {
  generateAiCaption,
  generateAiDepthMap,
  removeAiBackground,
  upscaleAiImage,
  ProcessingProgress,
} from "@/services/transformersService";

interface ImageLabViewProps {
  gpuStats: WebGpuStats;
}

type ActiveStudioTab = "diffusion" | "bg-removal" | "upscaling" | "depth-map" | "captioning";

interface GeneratedArtwork {
  url: string;
  prompt: string;
  backend: "webgpu" | "cloud";
  seed?: number;
  renderTime: string;
}

export const ImageLabView: React.FC<ImageLabViewProps> = ({ gpuStats }) => {
  const [activeTab, setActiveTab] = useState<ActiveStudioTab>("diffusion");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cacheFileInputRef = useRef<HTMLInputElement | null>(null);

  // Diffusion State (smart-image-engine)
  const [prompt, setPrompt] = useState(
    "A majestic snow leopard in a bioluminescent mountain forest at dusk, 8k resolution, cinematic lighting, photorealistic",
  );
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, deformed, distorted, low quality, artifacts",
  );
  const [style, setStyle] = useState("Photorealistic");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:3">("1:1");
  const [seed, setSeed] = useState<number>(428912);
  const [steps, setSteps] = useState(1);
  const [guidance, setGuidance] = useState(7.5);
  const [backendMode, setBackendMode] = useState<"auto" | "webgpu" | "cloud">("auto");
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderTime, setRenderTime] = useState<string>("1.8s");
  const [engineBackend, setEngineBackend] = useState<SmartImageBackend>("uninitialized");
  const [engineProgressStatus, setEngineProgressStatus] = useState<string>("");
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Cache Tools State
  const [showCacheModal, setShowCacheModal] = useState(false);
  const [cacheSizeBytes, setCacheSizeBytes] = useState<number | null>(null);
  const [cacheActionLoading, setCacheActionLoading] = useState(false);
  const [cacheActionMsg, setCacheActionMsg] = useState<string | null>(null);

  // Artworks state
  const [currentArtwork, setCurrentArtwork] = useState<GeneratedArtwork | null>(null);
  const [recentArtworks, setRecentArtworks] = useState<GeneratedArtwork[]>([]);

  // Initialize SmartImageEngine once on mount
  useEffect(() => {
    const force = backendMode === "auto" ? undefined : backendMode;
    initSmartImageEngine((status) => {
      setEngineProgressStatus(status);
    }, force)
      .then((backend) => {
        setEngineBackend(backend);
      })
      .catch((err) => {
        console.warn("SmartImageEngine initialization note:", err);
      });
  }, [backendMode]);

  // Load cache size when cache modal is opened
  const refreshCacheSize = async () => {
    try {
      const bytes = await getModelCacheSize();
      setCacheSizeBytes(bytes);
    } catch {
      setCacheSizeBytes(null);
    }
  };

  const handleExportCache = async () => {
    setCacheActionLoading(true);
    setCacheActionMsg("Exporting model cache snapshot...");
    try {
      const blob = await exportModelCache();
      downloadModelCache(blob, "sd-turbo-cache.bin");
      setCacheActionMsg("Export complete! Snapshot file saved to downloads.");
      await refreshCacheSize();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCacheActionMsg(`Export error: ${msg}`);
    } finally {
      setCacheActionLoading(false);
    }
  };

  const handleImportCacheFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCacheActionLoading(true);
    setCacheActionMsg("Importing cache snapshot into browser Cache Storage...");
    try {
      const res = await importModelCache(file, {
        onProgress: (done, total) => {
          setCacheActionMsg(`Importing entry ${done}/${total}...`);
        },
      });
      setCacheActionMsg(
        `Success! Restored ${res.entriesRestored} entries into "${res.cacheName}".`,
      );
      await refreshCacheSize();
      // Re-initialize engine with cached data
      await initSmartImageEngine((status) => setEngineProgressStatus(status));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCacheActionMsg(`Import error: ${msg}`);
    } finally {
      setCacheActionLoading(false);
      if (cacheFileInputRef.current) cacheFileInputRef.current.value = "";
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm("Are you sure you want to clear the local model cache storage?")) return;
    setCacheActionLoading(true);
    setCacheActionMsg("Clearing cache...");
    try {
      await clearModelCache();
      setCacheActionMsg("Model cache cleared successfully.");
      await refreshCacheSize();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCacheActionMsg(`Clear error: ${msg}`);
    } finally {
      setCacheActionLoading(false);
    }
  };

  // Specific Tool Settings
  const [bgChoice, setBgChoice] = useState<
    "transparent" | "white" | "black" | "cyberpunk" | "studio"
  >("transparent");
  const [upscaleFactor, setUpscaleFactor] = useState<2 | 4>(2);
  const [captionPrefix, setCaptionPrefix] = useState<string>("a photo of");
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isSpeakingCaption, setIsSpeakingCaption] = useState(false);

  // Active Transformers.js processing
  const [sourceImage, setSourceImage] = useState<string>(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  );
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [generatedCaption, setGeneratedCaption] = useState<string | null>(null);
  const [splitSliderPos, setSplitSliderPos] = useState<number>(50);
  const [progressState, setProgressState] = useState<ProcessingProgress>({
    status: "idle",
    progress: 0,
    message: "",
  });

  const sampleLibrary = [
    {
      title: "Portrait (Woman)",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Mountain Vista",
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Alpine Forest",
      url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Emerald Lake",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const styles = [
    {
      label: "Photorealistic",
      promptAdd: ", ultra-realistic photography, 8k, highly detailed",
    },
    {
      label: "Anime / Manga",
      promptAdd: ", anime aesthetic, Makoto Shinkai style, vivid colors",
    },
    {
      label: "Cyberpunk",
      promptAdd: ", cyberpunk neon city, futuristic synthwave, volumetric lighting",
    },
    {
      label: "3D Render",
      promptAdd: ", octane 3D render, Pixar style, raytracing reflections",
    },
    {
      label: "Oil Painting",
      promptAdd: ", classical oil on canvas, textured brushstrokes, fine art",
    },
    {
      label: "Turbo Fast",
      promptAdd: ", sharp focus, dynamic composition",
    },
  ];

  const handleGenerateDiffusion = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setGenerationError(null);
    const start = performance.now();

    let width = 1024;
    let height = 1024;
    if (aspectRatio === "16:9") {
      width = 1024;
      height = 576;
    } else if (aspectRatio === "9:16") {
      width = 576;
      height = 1024;
    } else if (aspectRatio === "4:3") {
      width = 1024;
      height = 768;
    }

    try {
      const selectedStyleObj = styles.find((s) => s.label === style);
      const fullPrompt = prompt + (selectedStyleObj ? selectedStyleObj.promptAdd : "");

      const force = backendMode === "auto" ? undefined : backendMode;
      const result = await generateSmartImage({
        prompt: fullPrompt,
        width,
        height,
        seed,
        numInferenceSteps: steps,
        forceBackend: force,
        onProgress: (status) => {
          setEngineProgressStatus(status);
        },
      });

      const elapsed = ((performance.now() - start) / 1000).toFixed(1);
      setRenderTime(`${elapsed}s`);

      const artwork: GeneratedArtwork = {
        url: result.url,
        prompt: fullPrompt,
        backend: result.backend,
        seed: result.seed ?? seed,
        renderTime: `${elapsed}s`,
      };

      setCurrentArtwork(artwork);
      setRecentArtworks((prev) => [artwork, ...prev.slice(0, 11)]);
    } catch (err: unknown) {
      console.error("SmartImageEngine error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate image. Please check your network or try a different prompt.";
      setGenerationError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run Real In-Browser AI Task
  const handleRunTransformerTask = async (task: ActiveStudioTab) => {
    if (
      !sourceImage ||
      progressState.status === "processing" ||
      progressState.status === "loading-model"
    )
      return;

    setProgressState({
      status: "loading-model",
      progress: 10,
      message: "Initializing In-Browser Neural Runtime...",
    });

    try {
      if (task === "bg-removal") {
        const result = await removeAiBackground(sourceImage, bgChoice, setProgressState);
        setProcessedImage(result);
      } else if (task === "upscaling") {
        const result = await upscaleAiImage(sourceImage, upscaleFactor, setProgressState);
        setProcessedImage(result);
      } else if (task === "depth-map") {
        const result = await generateAiDepthMap(sourceImage, setProgressState);
        setProcessedImage(result);
      } else if (task === "captioning") {
        const caption = await generateAiCaption(sourceImage, captionPrefix, setProgressState);
        setGeneratedCaption(caption);
        setProcessedImage(sourceImage);
      }
    } catch (err: unknown) {
      console.error(err);
      setProgressState({
        status: "error",
        progress: 0,
        message: "Pipeline inference error. Check image format.",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setSourceImage(dataUrl);
          setProcessedImage(null);
          setGeneratedCaption(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpeakCaption = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeakingCaption(true);
      utterance.onend = () => setIsSpeakingCaption(false);
      utterance.onerror = () => setIsSpeakingCaption(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyCaption = () => {
    if (generatedCaption) {
      navigator.clipboard.writeText(generatedCaption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#070b14] text-slate-100 overflow-y-auto font-sans p-3 sm:p-6 pb-24 md:pb-8 space-y-5 sm:space-y-6">
      {/* 100% Client-Side Privacy Notice */}
      <div className="max-w-6xl mx-auto w-full bg-[#0b1424] border border-[#1e3458] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <span>
            <strong className="text-white">100% Private In-Browser AI:</strong> All image models
            (MODNet bg-remove, super-resolution-js, captionify) execute locally inside your browser
            memory. Zero external transmissions unless you use Google Search Grounding.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#38bdf8] bg-[#102038] px-2.5 py-1 rounded-lg border border-[#1d3862] flex-shrink-0">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span>WebGPU / WASM Local</span>
        </div>
      </div>

      {/* Top Transformers.js Showcase Carousel */}
      <div className="max-w-6xl mx-auto w-full">
        <TransformersShowcase
          onSelectFeature={(feat, customImg) => {
            setActiveTab(feat as ActiveStudioTab);
            setProcessedImage(null);
            setGeneratedCaption(null);
            if (customImg) {
              setSourceImage(customImg);
            } else if (feat === "bg-removal") {
              setSourceImage(sampleLibrary[0]!.url);
            } else if (feat === "upscaling") {
              setSourceImage(sampleLibrary[1]!.url);
            } else if (feat === "depth-map") {
              setSourceImage(sampleLibrary[2]!.url);
            } else if (feat === "captioning") {
              setSourceImage(sampleLibrary[3]!.url);
            }
          }}
        />
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-6xl mx-auto w-full pb-2 border-b border-[#14233a]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none -mx-1 px-1 sm:flex-wrap">
          <button
            onClick={() => setActiveTab("diffusion")}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              activeTab === "diffusion"
                ? "bg-[#38bdf8] text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                : "bg-[#0c1424] hover:bg-[#132238] text-slate-300 border border-[#172b47]"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            smart-image-engine
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-slate-900 font-bold">
              v1.0
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("bg-removal");
              setProcessedImage(null);
              setGeneratedCaption(null);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              activeTab === "bg-removal"
                ? "bg-gradient-to-r from-[#e879f9] to-[#c084fc] text-slate-950 shadow-[0_0_12px_rgba(216,70,239,0.4)]"
                : "bg-[#0c1424] hover:bg-[#132238] text-slate-300 border border-[#172b47]"
            }`}
          >
            <Crop className="h-3.5 w-3.5" />
            bg-remove
          </button>

          <button
            onClick={() => {
              setActiveTab("upscaling");
              setProcessedImage(null);
              setGeneratedCaption(null);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              activeTab === "upscaling"
                ? "bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                : "bg-[#0c1424] hover:bg-[#132238] text-slate-300 border border-[#172b47]"
            }`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Super-Resolution
          </button>

          <button
            onClick={() => {
              setActiveTab("depth-map");
              setProcessedImage(null);
              setGeneratedCaption(null);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              activeTab === "depth-map"
                ? "bg-gradient-to-r from-[#818cf8] to-[#6366f1] text-white shadow-[0_0_12px_rgba(129,140,248,0.4)]"
                : "bg-[#0c1424] hover:bg-[#132238] text-slate-300 border border-[#172b47]"
            }`}
          >
            <SplitSquareVertical className="h-3.5 w-3.5" />
            3D Depth Map
          </button>

          <button
            onClick={() => {
              setActiveTab("captioning");
              setProcessedImage(null);
              setGeneratedCaption(null);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
              activeTab === "captioning"
                ? "bg-gradient-to-r from-[#ec4899] to-[#f43f5e] text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]"
                : "bg-[#0c1424] hover:bg-[#132238] text-slate-300 border border-[#172b47]"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Captionify
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
          <span className="text-[11px] font-mono text-slate-400">GPU VRAM:</span>
          <span className="text-xs font-mono font-bold text-[#38bdf8]">
            {gpuStats.memoryUsedGb} / {gpuStats.memoryTotalGb} GB
          </span>
        </div>
      </div>

      {activeTab === "diffusion" ? (
        /* Diffusion Studio (smart-image-engine) */
        <div className="space-y-4 max-w-6xl mx-auto w-full">
          {/* Smart Image Engine Banner & Cache Controls */}
          <div className="bg-[#0b1424] border border-[#1b2f4f] rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#10243e] border border-[#234573] flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white font-mono">smart-image-engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    SD-Turbo + WebGPU
                  </span>
                  <a
                    href="https://github.com/chaitanyalp24-gif/smart-image-engine"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#38bdf8] hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    github.com/chaitanyalp24-gif/smart-image-engine
                  </a>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  100% Free Hybrid AI Engine. Runs Xenova/sd-turbo locally via WebGPU, with
                  automatic fallback to Pollinations.ai cloud API.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCacheModal(true);
                refreshCacheSize();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#132238] hover:bg-[#1b3152] text-xs font-semibold text-slate-200 border border-[#23426c] transition cursor-pointer flex-shrink-0"
            >
              <HardDrive className="h-3.5 w-3.5 text-[#38bdf8]" />
              Cache Snapshot Tools
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            {/* Controls Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#0b1322] border border-[#172740] rounded-2xl p-4 space-y-3.5 shadow-xl">
                <div>
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Wand2 className="h-3.5 w-3.5 text-[#38bdf8]" />
                    Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    placeholder="Describe your visual concept..."
                    className="w-full mt-1.5 p-3 rounded-xl bg-[#070e1a] border border-[#1b3152] focus:border-[#38bdf8] text-xs text-slate-100 outline-none resize-none transition leading-relaxed font-sans placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Negative Prompt</label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-[#070e1a] border border-[#1b3152] focus:border-[#38bdf8] text-xs text-slate-300 outline-none transition"
                  />
                </div>

                {/* Backend Selection Mode */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Execution Backend
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    {[
                      { id: "auto", label: "Auto (WebGPU/Cloud)", icon: Sparkles },
                      { id: "webgpu", label: "Force WebGPU", icon: Zap },
                      { id: "cloud", label: "Force Cloud", icon: Globe },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBackendMode(b.id as "auto" | "webgpu" | "cloud")}
                        className={`p-2 rounded-xl border transition flex flex-col items-center gap-1 cursor-pointer font-medium ${
                          backendMode === b.id
                            ? "bg-[#10243e] border-[#38bdf8] text-white shadow-sm"
                            : "bg-[#070e1a] border-[#15273f] text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        <b.icon className="h-3.5 w-3.5 text-[#38bdf8]" />
                        <span className="truncate text-center">{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Presets */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Artistic Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {styles.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => setStyle(s.label)}
                        className={`p-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                          style === s.label
                            ? "bg-[#10243e] border-[#38bdf8] text-white shadow-sm"
                            : "bg-[#070e1a] border-[#15273f] text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["1:1", "16:9", "9:16", "4:3"] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`p-2 rounded-xl text-xs font-mono font-medium border transition cursor-pointer ${
                          aspectRatio === ratio
                            ? "bg-[#10243e] border-[#38bdf8] text-white"
                            : "bg-[#070e1a] border-[#15273f] text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Parameters */}
                <div className="pt-2 border-t border-[#14233a] grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Inference Steps (SD-Turbo)</span>
                      <span className="font-mono text-white">{steps}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={steps}
                      onChange={(e) => setSteps(Number(e.target.value))}
                      className="w-full accent-[#38bdf8] h-1.5 bg-[#14233a] rounded-lg"
                    />
                    <span className="text-[10px] text-slate-500">1-step distilled turbo</span>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Random Seed</span>
                      <button
                        onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
                        className="text-[10px] text-[#38bdf8] hover:underline flex items-center gap-0.5"
                      >
                        <Dice5 className="h-2.5 w-2.5" /> randomize
                      </button>
                    </div>
                    <input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(Number(e.target.value))}
                      className="w-full p-1.5 rounded-lg bg-[#070e1a] border border-[#1b3152] text-xs font-mono text-white outline-none"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateDiffusion}
                  disabled={isGenerating}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                    isGenerating
                      ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-[#0ea5e9] hover:opacity-95 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Synthesizing Image ({engineProgressStatus || "smart-image-engine"})...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 fill-current" />
                      Generate with smart-image-engine
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Image Canvas */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#0b1322] border border-[#172740] rounded-2xl p-4 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden shadow-2xl">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-4 text-center p-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-t-[#38bdf8] border-r-transparent border-b-[#38bdf8] border-l-transparent animate-spin" />
                      <Sparkles className="h-6 w-6 text-[#38bdf8] absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-sm font-bold text-white">
                        Generating via smart-image-engine
                      </div>
                      <div className="text-xs text-[#38bdf8] font-mono">
                        {engineProgressStatus || "Initializing neural pipeline..."}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {engineBackend === "webgpu"
                          ? `Local WebGPU SD-Turbo (${gpuStats.gpuName})`
                          : "Cloud Fallback (Pollinations.ai)"}
                      </div>
                    </div>
                  </div>
                ) : generationError ? (
                  /* Explicit Error State */
                  <div className="flex flex-col items-center justify-center gap-3.5 p-6 text-center max-w-md">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-sm font-bold text-red-300">Generation Failed</div>
                      <div className="text-xs text-slate-300 leading-relaxed bg-[#140a0f] p-3 rounded-xl border border-red-900/40 font-mono text-left">
                        {generationError}
                      </div>
                    </div>
                    <button
                      onClick={handleGenerateDiffusion}
                      className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#132238] hover:bg-[#1a2e4c] text-xs font-semibold text-slate-200 border border-[#1f375a] transition cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Retry Generation
                    </button>
                  </div>
                ) : currentArtwork ? (
                  /* Active Rendered Artwork with Honest Backend Label */
                  <div className="relative group w-full flex flex-col items-center">
                    <img
                      src={currentArtwork.url}
                      alt={currentArtwork.prompt}
                      className="rounded-xl max-h-[380px] w-auto object-contain shadow-2xl border border-[#1b2e4b]"
                    />
                    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-3 pt-3 border-t border-[#15243b] text-xs text-slate-400">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Honest Backend Label */}
                        {currentArtwork.backend === "webgpu" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                            <Zap className="h-3.5 w-3.5 text-emerald-400" />
                            Generated locally (WebGPU SD-Turbo)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-950/80 text-sky-300 border border-sky-800/60">
                            <Globe className="h-3.5 w-3.5 text-sky-400" />
                            Generated via cloud fallback (Pollinations.ai)
                          </span>
                        )}
                        <span>•</span>
                        <span className="font-mono text-[#38bdf8]">
                          {currentArtwork.renderTime}
                        </span>
                        {currentArtwork.seed !== undefined && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 font-mono">
                              Seed: {currentArtwork.seed}
                            </span>
                          </>
                        )}
                      </div>
                      <a
                        href={currentArtwork.url}
                        download={`smart-image-${currentArtwork.seed || Date.now()}.png`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121f35] hover:bg-[#182b4a] text-slate-100 font-medium transition cursor-pointer border border-[#1e3458] self-start sm:self-auto"
                      >
                        <Download className="h-3.5 w-3.5 text-[#38bdf8]" />
                        Download Image
                      </a>
                    </div>
                  </div>
                ) : (
                  /* Initial Idle Canvas */
                  <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-slate-400">
                    <div className="w-14 h-14 rounded-2xl bg-[#0e1829] border border-[#182c49] flex items-center justify-center text-[#38bdf8] shadow-inner">
                      <Wand2 className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-200">
                        smart-image-engine Canvas
                      </div>
                      <div className="text-xs text-slate-400 max-w-sm leading-relaxed">
                        Enter your prompt and click{" "}
                        <strong>Generate with smart-image-engine</strong>. Images are generated 100%
                        locally if WebGPU is available, or seamlessly via Pollinations.ai cloud API.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* History Gallery */}
              {recentArtworks.length > 0 && (
                <div className="bg-[#0b1322] border border-[#172740] rounded-2xl p-4 space-y-2.5 shadow-xl">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Recent smart-image-engine Renders</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {recentArtworks.length} images
                    </span>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5">
                    {recentArtworks.map((art, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentArtwork(art);
                          setGenerationError(null);
                        }}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer relative group ${
                          currentArtwork?.url === art.url
                            ? "border-[#38bdf8] ring-2 ring-[#38bdf8]/40 scale-105"
                            : "border-[#192b47] hover:border-slate-400 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <img src={art.url} alt="Thumb" className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 right-0 p-0.5 bg-black/70 rounded-tl">
                          {art.backend === "webgpu" ? (
                            <Zap className="h-2.5 w-2.5 text-emerald-400" />
                          ) : (
                            <Globe className="h-2.5 w-2.5 text-sky-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cache Tools Snapshot Modal */}
          {showCacheModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="bg-[#0c1424] border border-[#1e3458] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#1b2e4b]">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-[#38bdf8]" />
                    <h3 className="text-sm font-bold text-white">
                      smart-image-engine Cache Snapshot Manager
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowCacheModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#14233a] transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  On shared machines or ephemeral cloud sessions, local neural models are wiped
                  between browser refreshes. <strong>smart-image-engine/cache-tools</strong> allows
                  you to export your downloaded model cache to a single portable{" "}
                  <code className="text-[#38bdf8] font-mono">.bin</code> file and restore it in
                  seconds without re-downloading gigabytes of weights over the network.
                </p>

                <div className="bg-[#070e1a] border border-[#182a44] rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Current Cache Storage Size:</span>
                  <span className="text-xs font-mono font-bold text-[#38bdf8]">
                    {cacheSizeBytes !== null
                      ? `${(cacheSizeBytes / (1024 * 1024)).toFixed(1)} MB`
                      : "Calculating..."}
                  </span>
                </div>

                {cacheActionMsg && (
                  <div className="text-xs text-[#38bdf8] bg-[#0f213b] p-2.5 rounded-xl border border-[#1f3a63] font-mono">
                    {cacheActionMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={handleExportCache}
                    disabled={cacheActionLoading}
                    className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#142947] hover:bg-[#1c3963] text-xs font-semibold text-white border border-[#234674] transition cursor-pointer"
                  >
                    <Download className="h-4 w-4 text-[#38bdf8]" />
                    Export Snapshot (.bin)
                  </button>

                  <button
                    onClick={() => cacheFileInputRef.current?.click()}
                    disabled={cacheActionLoading}
                    className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#142947] hover:bg-[#1c3963] text-xs font-semibold text-white border border-[#234674] transition cursor-pointer"
                  >
                    <Upload className="h-4 w-4 text-emerald-400" />
                    Import Snapshot (.bin)
                  </button>
                  <input
                    ref={cacheFileInputRef}
                    type="file"
                    accept=".bin"
                    onChange={handleImportCacheFile}
                    className="hidden"
                  />
                </div>

                <div className="pt-2 border-t border-[#1b2e4b] flex items-center justify-between">
                  <button
                    onClick={handleClearCache}
                    disabled={cacheActionLoading}
                    className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear Cache Bucket
                  </button>

                  <button
                    onClick={() => setShowCacheModal(false)}
                    className="px-4 py-1.5 rounded-xl bg-[#14233a] hover:bg-[#1b3152] text-xs font-semibold text-slate-200 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Real Transformers.js & WebGPU Pipeline View (bg-remove, super-resolution-js, captionify) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto w-full">
          {/* Left: Input Selection, Config & Actions */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0b1322] border border-[#172740] rounded-2xl p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Select Source Image
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[#38bdf8] hover:text-white flex items-center gap-1 bg-[#121f35] px-2.5 py-1 rounded-lg border border-[#1e3458] transition cursor-pointer"
                >
                  <Upload className="h-3 w-3" /> Upload Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Sample Preset Thumbnails */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {sampleLibrary.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSourceImage(item.url);
                      setProcessedImage(null);
                      setGeneratedCaption(null);
                    }}
                    className={`h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer relative group ${
                      sourceImage === item.url
                        ? "border-[#38bdf8] ring-2 ring-[#38bdf8]/40"
                        : "border-[#192b47] hover:border-slate-400 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-center text-slate-200 py-0.5 truncate px-1">
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Model Action & Settings Card */}
            <div className="bg-[#0b1322] border border-[#172740] rounded-2xl p-4 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#38bdf8] uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 className="h-3.5 w-3.5" />
                  {activeTab === "bg-removal" && "bg-remove (RMBG-1.4)"}
                  {activeTab === "upscaling" && "super-resolution-js (ESRGAN)"}
                  {activeTab === "depth-map" && "dpt-hybrid-midas 3D"}
                  {activeTab === "captioning" && "captionify (ViT-GPT2)"}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-semibold">
                  100% In-Browser
                </span>
              </div>

              {/* Attribution links to requested open source repos */}
              <div className="text-[11px] text-slate-400">
                {activeTab === "bg-removal" && (
                  <div className="space-y-2">
                    <p>
                      Powered by <strong>Addy Osmani's bg-remove</strong> architecture. Uses
                      in-browser neural segmentation (RMBG-1.4 / MODNet) to cleanly extract alpha
                      matting boundaries.
                    </p>
                    <a
                      href="https://github.com/addyosmani/bg-remove"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#38bdf8] hover:underline font-mono text-[10px]"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      github.com/addyosmani/bg-remove
                    </a>

                    {/* Background Replacement Options */}
                    <div className="pt-2 border-t border-[#172740]">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                        Background Matte Fill
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                        {[
                          { id: "transparent", label: "Transparent" },
                          { id: "white", label: "Studio White" },
                          { id: "black", label: "OLED Dark" },
                          { id: "cyberpunk", label: "Cyberpunk" },
                          { id: "studio", label: "Soft Studio" },
                        ].map((bg) => (
                          <button
                            key={bg.id}
                            onClick={() =>
                              setBgChoice(
                                bg.id as "transparent" | "white" | "black" | "cyberpunk" | "studio",
                              )
                            }
                            className={`p-1.5 rounded-lg border transition font-medium cursor-pointer ${
                              bgChoice === bg.id
                                ? "bg-[#10243e] border-[#38bdf8] text-white shadow-sm"
                                : "bg-[#070e1a] border-[#15273f] text-slate-400 hover:border-slate-500"
                            }`}
                          >
                            {bg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "upscaling" && (
                  <div className="space-y-2">
                    <p>
                      Powered by <strong>Joseph Rocca's super-resolution-js</strong> architecture.
                      Enhances low-resolution imagery using edge-preserving neural filters directly
                      in browser WebGL memory.
                    </p>
                    <a
                      href="https://github.com/josephrocca/super-resolution-js"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#38bdf8] hover:underline font-mono text-[10px]"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      github.com/josephrocca/super-resolution-js
                    </a>

                    {/* Scale factor controls */}
                    <div className="pt-2 border-t border-[#172740]">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                        Super-Resolution Scale
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setUpscaleFactor(2)}
                          className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            upscaleFactor === 2
                              ? "bg-[#10243e] border-[#38bdf8] text-white shadow-sm"
                              : "bg-[#070e1a] border-[#15273f] text-slate-400"
                          }`}
                        >
                          2x Super HD (Fast)
                        </button>
                        <button
                          onClick={() => setUpscaleFactor(4)}
                          className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            upscaleFactor === 4
                              ? "bg-[#10243e] border-[#38bdf8] text-white shadow-sm"
                              : "bg-[#070e1a] border-[#15273f] text-slate-400"
                          }`}
                        >
                          4x Ultra HD (Deep)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "depth-map" && (
                  <p>
                    Estimates continuous 3D relative depth map for 3D parallax, stereoscopy, and
                    depth-of-field shaders using `dpt-hybrid-midas`.
                  </p>
                )}

                {activeTab === "captioning" && (
                  <div className="space-y-2">
                    <p>
                      Powered by <strong>JaggedSoft's Captionify</strong>. In-browser
                      vision-language model (ViT-GPT2) converting pixel tensors into rich
                      descriptive text with zero server upload.
                    </p>
                    <a
                      href="https://github.com/jaggedsoft/captionify"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#38bdf8] hover:underline font-mono text-[10px]"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      github.com/jaggedsoft/captionify
                    </a>

                    {/* Prefix guidance options */}
                    <div className="pt-2 border-t border-[#172740]">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                        Caption Prefix Prompt
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {[
                          "a photo of",
                          "an aesthetic shot of",
                          "detailed scene of",
                          "a portrait of",
                        ].map((pref) => (
                          <button
                            key={pref}
                            onClick={() => setCaptionPrefix(pref)}
                            className={`p-1.5 rounded-lg border transition text-left px-2 truncate font-medium cursor-pointer ${
                              captionPrefix === pref
                                ? "bg-[#10243e] border-[#ec4899] text-white shadow-sm"
                                : "bg-[#070e1a] border-[#15273f] text-slate-400 hover:border-slate-500"
                            }`}
                          >
                            "{pref}..."
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress feedback bar */}
              {progressState.status !== "idle" && (
                <div className="space-y-1.5 pt-2 border-t border-[#172740]">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">{progressState.message}</span>
                    <span className="font-mono text-[#38bdf8] font-bold">
                      {progressState.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-[#101e33] h-2 rounded-full overflow-hidden p-0.5 border border-[#182e4e]">
                    <div
                      className="bg-[#38bdf8] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                      style={{ width: `${progressState.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => handleRunTransformerTask(activeTab)}
                disabled={
                  progressState.status === "processing" || progressState.status === "loading-model"
                }
                className={`w-full py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                  progressState.status === "processing" || progressState.status === "loading-model"
                    ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#a855f7] via-[#8b5cf6] to-[#0284c7] hover:opacity-95 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                }`}
              >
                {progressState.status === "processing" ||
                progressState.status === "loading-model" ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Executing In-Browser Shader...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 text-amber-300" />
                    Run Local In-Browser Inference
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Live Interactive View & Comparison */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#0b1322] border border-[#172740] rounded-2xl p-4 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden shadow-2xl">
              {processedImage ? (
                <div className="w-full flex flex-col items-center space-y-3">
                  {/* Interactive Before/After Split Viewer */}
                  {activeTab === "bg-removal" || activeTab === "upscaling" ? (
                    <div className="relative w-full h-[360px] rounded-xl overflow-hidden select-none border border-[#172740] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:8px_8px]">
                      {/* Original image */}
                      <img
                        src={sourceImage}
                        alt="Original"
                        className="absolute inset-0 w-full h-full object-contain"
                      />

                      {/* Processed overlay with split slider */}
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{
                          clipPath: `inset(0 0 0 ${splitSliderPos}%)`,
                          backgroundImage:
                            activeTab === "bg-removal" && bgChoice === "transparent"
                              ? "repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 50% / 14px 14px"
                              : "none",
                        }}
                      >
                        <img
                          src={processedImage}
                          alt="Processed"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Slider dividing bar */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] pointer-events-none"
                        style={{ left: `${splitSliderPos}%` }}
                      />

                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-medium text-slate-200 pointer-events-none border border-white/10">
                        Original
                      </div>
                      <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-medium text-cyan-300 pointer-events-none border border-cyan-400/30">
                        AI Output
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={splitSliderPos}
                        onChange={(e) => setSplitSliderPos(Number(e.target.value))}
                        className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
                        title="Drag to compare"
                      />
                    </div>
                  ) : (
                    /* Depth Map or Single View */
                    <div className="relative w-full h-[360px] rounded-xl overflow-hidden flex items-center justify-center bg-[#050912] border border-[#172740]">
                      <img
                        src={processedImage}
                        alt="Transformers.js output"
                        className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
                      />
                    </div>
                  )}

                  {/* Caption Result Card with Copy & Audio Button */}
                  {generatedCaption && (
                    <div className="w-full p-3 rounded-xl bg-[#0e192c] border border-[#1b2f4f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                      <div className="flex items-center gap-2 flex-1">
                        <Eye className="h-4 w-4 text-[#ec4899] flex-shrink-0" />
                        <p className="text-xs text-slate-200 font-medium italic">
                          “{generatedCaption}”
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                        <button
                          onClick={() => handleSpeakCaption(generatedCaption)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition cursor-pointer ${
                            isSpeakingCaption
                              ? "bg-[#ec4899] text-white border-[#ec4899] animate-pulse"
                              : "bg-[#162742] hover:bg-[#1e3559] text-slate-300 border-[#23406a]"
                          }`}
                          title="Speak caption aloud"
                        >
                          <Volume2 className="h-3 w-3" />
                          <span className="text-[11px]">Listen</span>
                        </button>

                        <button
                          onClick={handleCopyCaption}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#162742] hover:bg-[#1e3559] text-xs text-slate-200 border border-[#23406a] transition cursor-pointer"
                        >
                          {copiedCaption ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400 text-[11px]">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 text-slate-400" />
                              <span className="text-[11px]">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bottom Download & Info */}
                  <div className="w-full flex items-center justify-between pt-2 border-t border-[#15243b] text-xs text-slate-400">
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Pipeline Execution Completed (100% Local)
                    </span>
                    <a
                      href={processedImage}
                      download={`broai-${activeTab}.png`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121f35] hover:bg-[#182b4a] text-slate-100 font-medium transition cursor-pointer border border-[#1e3458]"
                    >
                      <Download className="h-3.5 w-3.5 text-[#38bdf8]" />
                      Download Result
                    </a>
                  </div>
                </div>
              ) : (
                /* Empty Preview Prompt */
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#0e1a2f] border border-[#1c3254] flex items-center justify-center text-[#38bdf8]">
                    <ImageIcon className="h-8 w-8 opacity-60" />
                  </div>
                  <div className="text-sm font-semibold text-white">Source Image Ready</div>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Click <strong>"Run Local In-Browser Inference"</strong> to execute the neural
                    network pipeline natively on your machine.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
