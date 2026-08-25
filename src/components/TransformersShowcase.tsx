import React, { useState } from "react";
import {
  Sparkles,
  Maximize2,
  SplitSquareVertical,
  Eye,
  Crop,
  Layers,
  Wand2,
  Upload,
  Volume2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface TransformersShowcaseProps {
  onSelectFeature?: (featureId: string, customImage?: string) => void;
  className?: string;
}

// 5 Curated Suites for the 5 pagination dots matching the screenshot
const SHOWCASE_SUITES = [
  {
    name: "Studio Essentials",
    cards: {
      bgRemoval: {
        title: "Background Removal",
        original:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        label: "Studio Portrait",
      },
      upscaling: {
        title: "Image Upscaling",
        original:
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
        label: "Mountain Vista",
      },
      depthMap: {
        title: "Depth Map",
        original:
          "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
        label: "Alpine Forest",
      },
      captioning: {
        title: "Image Captioning",
        original:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        caption: "“A serene mountain lake surrounded by pine trees.”",
      },
    },
  },
  {
    name: "Cyberpunk & Neon",
    cards: {
      bgRemoval: {
        title: "Background Removal",
        original:
          "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
        label: "Cyberpunk Warrior",
      },
      upscaling: {
        title: "Image Upscaling",
        original:
          "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        label: "Tokyo City Lights",
      },
      depthMap: {
        title: "Depth Map",
        original:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        label: "Hologram Corridor",
      },
      captioning: {
        title: "Image Captioning",
        original:
          "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
        caption: "“A futuristic metropolis illuminated by vibrant neon holographic signs.”",
      },
    },
  },
  {
    name: "Wildlife & Nature",
    cards: {
      bgRemoval: {
        title: "Background Removal",
        original:
          "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80",
        label: "Majestic Tiger",
      },
      upscaling: {
        title: "Image Upscaling",
        original:
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
        label: "Misty Sunrise Valley",
      },
      depthMap: {
        title: "Depth Map",
        original:
          "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=600&q=80",
        label: "Yosemite Waterfall",
      },
      captioning: {
        title: "Image Captioning",
        original:
          "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
        caption: "“Vibrant aurora borealis dancing above snow-capped arctic peaks.”",
      },
    },
  },
  {
    name: "Modern Architecture",
    cards: {
      bgRemoval: {
        title: "Background Removal",
        original:
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
        label: "Designer Chair",
      },
      upscaling: {
        title: "Image Upscaling",
        original:
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
        label: "Glass Skyscraper",
      },
      depthMap: {
        title: "Depth Map",
        original:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
        label: "Minimalist Villa",
      },
      captioning: {
        title: "Image Captioning",
        original:
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80",
        caption: "“A contemporary luxury residence with warm ambient interior lighting.”",
      },
    },
  },
  {
    name: "Product Design",
    cards: {
      bgRemoval: {
        title: "Background Removal",
        original:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
        label: "Sneaker Matting",
      },
      upscaling: {
        title: "Image Upscaling",
        original:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        label: "Smart Watch HD",
      },
      depthMap: {
        title: "Depth Map",
        original:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        label: "Wireless Headphones",
      },
      captioning: {
        title: "Image Captioning",
        original:
          "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
        caption: "“Vintage mechanical camera with detailed optical lens reflections.”",
      },
    },
  },
];

export const TransformersShowcase: React.FC<TransformersShowcaseProps> = ({
  onSelectFeature,
  className = "",
}) => {
  const [activeSuiteIndex, setActiveSuiteIndex] = useState<number>(0);
  const [sliderPositionBg, setSliderPositionBg] = useState<number>(50);
  const [sliderPositionUpscale, setSliderPositionUpscale] = useState<number>(50);
  const [isDepthInverted, setIsDepthInverted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentSuite = SHOWCASE_SUITES[activeSuiteIndex] ?? SHOWCASE_SUITES[0]!;

  const handleSpeakCaption = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[“”"]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      id="transformers-showcase-container"
      className={`w-full bg-[#050914] border border-[#a855f7]/30 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden font-sans ${className}`}
    >
      {/* Glowing Neon Header matching user's image screenshot */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-[#a855f7]/20 border border-[#a855f7]/40 text-[#c084fc]">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-wider bg-gradient-to-r from-[#e879f9] via-[#c084fc] to-[#38bdf8] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(216,70,239,0.5)]">
            IMAGE LAB – POWERED BY TRANSFORMERS.JS (ALL LOCAL)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Suite {activeSuiteIndex + 1}/5:{" "}
            <strong className="text-slate-200">{currentSuite.name}</strong>
          </span>
        </div>
      </div>

      {/* 4 Interactive Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Background Removal (Interactive Split Slider) */}
        <div
          onClick={() => onSelectFeature?.("bg-removal", currentSuite.cards.bgRemoval.original)}
          className="group bg-[#081220] border border-[#1e3456] hover:border-[#a855f7]/90 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col cursor-pointer relative"
        >
          <div className="py-2 px-3 bg-[#0a1628] border-b border-[#14233a] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Crop className="h-3.5 w-3.5 text-[#e879f9]" />
              Background Removal
            </span>
            <span className="text-[10px] text-[#e879f9] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold">
              Open <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>

          <div className="relative h-48 w-full select-none overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:8px_8px]">
            {/* Original portrait */}
            <img
              src={currentSuite.cards.bgRemoval.original}
              alt="Original"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Cutout over transparent checkered pattern with clip path */}
            <div
              className="absolute inset-0 bg-[#0d1522]"
              style={{
                clipPath: `inset(0 0 0 ${sliderPositionBg}%)`,
                backgroundImage:
                  "repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 50% / 12px 12px",
              }}
            >
              <img
                src={currentSuite.cards.bgRemoval.original}
                alt="Matte Cutout"
                className="w-full h-full object-cover mix-blend-screen brightness-110 contrast-125"
              />
            </div>

            {/* Split Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] pointer-events-none"
              style={{ left: `${sliderPositionBg}%` }}
            />

            {/* Interactive slider input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPositionBg}
              onChange={(e) => {
                e.stopPropagation();
                setSliderPositionBg(Number(e.target.value));
              }}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
              title="Drag slider to compare cutout"
            />

            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-medium text-slate-200 pointer-events-none border border-white/10">
              Original
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-medium text-[#e879f9] pointer-events-none border border-[#e879f9]/30">
              Cutout
            </div>
          </div>
        </div>

        {/* Card 2: Image Upscaling (Before / After Split Slider) */}
        <div
          onClick={() => onSelectFeature?.("upscaling", currentSuite.cards.upscaling.original)}
          className="group bg-[#081220] border border-[#1e3456] hover:border-[#38bdf8]/90 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col cursor-pointer relative"
        >
          <div className="py-2 px-3 bg-[#0a1628] border-b border-[#14233a] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5 text-[#38bdf8]" />
              Image Upscaling
            </span>
            <span className="text-[10px] text-[#38bdf8] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold">
              Open <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>

          <div className="relative h-48 w-full select-none overflow-hidden">
            {/* Low-res Left side */}
            <img
              src={currentSuite.cards.upscaling.original}
              alt="Before Upscaling"
              className="absolute inset-0 w-full h-full object-cover filter blur-[1.5px] brightness-90"
            />

            {/* High-res Right side */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${sliderPositionUpscale}%)` }}
            >
              <img
                src={currentSuite.cards.upscaling.original}
                alt="After Super Resolution"
                className="w-full h-full object-cover contrast-125 saturate-125 brightness-105"
              />
            </div>

            {/* Split Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] pointer-events-none"
              style={{ left: `${sliderPositionUpscale}%` }}
            />

            {/* Before / After Badges matching screenshot */}
            <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-semibold text-slate-300 pointer-events-none border border-white/10">
              Before
            </div>
            <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-semibold text-[#38bdf8] pointer-events-none border border-[#38bdf8]/30">
              After
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={sliderPositionUpscale}
              onChange={(e) => {
                e.stopPropagation();
                setSliderPositionUpscale(Number(e.target.value));
              }}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
              title="Drag slider to compare super-resolution"
            />
          </div>
        </div>

        {/* Card 3: Depth Map (3D Surface Normals) */}
        <div
          onClick={() => onSelectFeature?.("depth-map", currentSuite.cards.depthMap.original)}
          className="group bg-[#081220] border border-[#1e3456] hover:border-[#818cf8]/90 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col cursor-pointer relative"
        >
          <div className="py-2 px-3 bg-[#0a1628] border-b border-[#14233a] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <SplitSquareVertical className="h-3.5 w-3.5 text-[#818cf8]" />
              Depth Map
            </span>
            <span className="text-[10px] text-[#818cf8] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold">
              Open <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>

          <div className="relative h-48 w-full bg-[#0d1522] overflow-hidden flex items-center justify-center">
            {/* Grayscale Depth Map of Nature/Trees matching screenshot */}
            <img
              src={currentSuite.cards.depthMap.original}
              alt="Depth estimation"
              className={`w-full h-full object-cover filter contrast-200 brightness-85 transition-all duration-300 ${
                isDepthInverted ? "grayscale invert" : "grayscale invert-0"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#081220]/70 via-transparent to-transparent pointer-events-none" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDepthInverted(!isDepthInverted);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-[10px] text-slate-300 hover:text-white border border-white/10 z-10 transition"
              title="Toggle depth normal polarity"
            >
              Invert Shader
            </button>

            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-medium text-slate-200 pointer-events-none border border-white/10">
              dpt-hybrid-midas 3D
            </div>
          </div>
        </div>

        {/* Card 4: Image Captioning (ViT-GPT2 with Caption Pill) */}
        <div
          onClick={() => onSelectFeature?.("captioning", currentSuite.cards.captioning.original)}
          className="group bg-[#081220] border border-[#1e3456] hover:border-[#ec4899]/90 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col cursor-pointer relative"
        >
          <div className="py-2 px-3 bg-[#0a1628] border-b border-[#14233a] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-[#ec4899]" />
              Image Captioning
            </span>
            <span className="text-[10px] text-[#ec4899] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold">
              Open <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>

          <div className="relative h-48 w-full overflow-hidden flex flex-col justify-end">
            <img
              src={currentSuite.cards.captioning.original}
              alt="Mountain lake scene"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Caption pill matching screenshot */}
            <div className="relative z-10 m-2.5 p-2 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-center shadow-2xl flex items-center justify-between gap-1.5">
              <p className="text-[11px] font-medium text-slate-100 italic leading-snug flex-1 truncate text-left">
                {currentSuite.cards.captioning.caption}
              </p>
              <button
                onClick={(e) => handleSpeakCaption(e, currentSuite.cards.captioning.caption)}
                className={`p-1.5 rounded-lg border transition cursor-pointer flex-shrink-0 ${
                  isSpeaking
                    ? "bg-[#ec4899] text-white border-[#ec4899] animate-pulse"
                    : "bg-[#141f33] hover:bg-[#1d2d4a] text-slate-300 border-[#22395d]"
                }`}
                title="Speak caption (Text-to-Speech)"
              >
                <Volume2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Dots matching screenshot 2: ○ ● ○ ○ ○ */}
      <div className="flex items-center justify-center gap-2 mt-4 pt-1">
        {SHOWCASE_SUITES.map((suite, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSuiteIndex(idx)}
            className={`transition-all rounded-full cursor-pointer ${
              activeSuiteIndex === idx
                ? "w-3 h-3 bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.9)] scale-125"
                : "w-2 h-2 bg-slate-600 hover:bg-slate-400"
            }`}
            title={`Switch to ${suite.name}`}
            aria-label={`Showcase preset suite ${idx + 1}: ${suite.name}`}
          />
        ))}
      </div>
    </div>
  );
};
