import React, { useState } from "react";
import { Sparkles, Maximize2, SplitSquareVertical, Eye, Image as ImageIcon } from "lucide-react";

interface TransformersShowcaseProps {
  onSelectFeature?: (featureId: string) => void;
  className?: string;
}

export const TransformersShowcase: React.FC<TransformersShowcaseProps> = ({
  onSelectFeature,
  className = "",
}) => {
  const [activeDot, setActiveDot] = useState<number>(1);
  const [sliderPositionBg, setSliderPositionBg] = useState<number>(50);
  const [sliderPositionUpscale, setSliderPositionUpscale] = useState<number>(50);

  return (
    <div
      id="transformers-showcase-container"
      className={`w-full bg-[#050914] border border-[#a855f7]/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden font-sans ${className}`}
    >
      {/* Glowing Neon Header matching screenshot 2 */}
      <div className="text-center mb-5">
        <h2 className="text-sm md:text-base font-extrabold uppercase tracking-wider bg-gradient-to-r from-[#e879f9] via-[#c084fc] to-[#38bdf8] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(216,70,239,0.5)]">
          IMAGE LAB – POWERED BY TRANSFORMERS.JS (ALL LOCAL)
        </h2>
      </div>

      {/* 4 Interactive Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Background Removal (Split Slider) */}
        <div
          onClick={() => onSelectFeature?.("bg-removal")}
          className="group bg-[#081220] border border-[#1e3456] hover:border-[#a855f7]/80 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col cursor-pointer relative"
        >
          <div className="text-center py-1.5 px-3 bg-[#0a1628] border-b border-[#14233a] text-xs font-semibold text-slate-200">
            Background Removal
          </div>
          <div className="relative h-44 w-full select-none overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:8px_8px]">
            {/* Woman original portrait */}
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
              alt="Portrait"
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
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                alt="Portrait cutout"
                className="w-full h-full object-cover mix-blend-screen brightness-110"
              />
            </div>

            {/* Split Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none"
              style={{ left: `${sliderPositionBg}%` }}
            />

            {/* Interactive invisible slider input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPositionBg}
              onChange={(e) => setSliderPositionBg(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
              title="Drag to compare"
            />
          </div>
        </div>

        {/* Card 2: Image Upscaling (Before / After split slider) */}
        <div
          onClick={() => onSelectFeature?.("upscaling")}
          className="group bg-[#081220] border border-[#1e3456] hover:border-[#38bdf8]/80 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col cursor-pointer relative"
        >
          <div className="text-center py-1.5 px-3 bg-[#0a1628] border-b border-[#14233a] text-xs font-semibold text-slate-200">
            Image Upscaling
          </div>
          <div className="relative h-44 w-full select-none overflow-hidden">
            {/* Mountain Image */}
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80"
              alt="Mountain landscape"
              className="absolute inset-0 w-full h-full object-cover filter blur-[1px] brightness-90"
            />
            {/* High res right side */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${sliderPositionUpscale}%)` }}
            >
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=95"
                alt="Mountain landscape HD"
                className="w-full h-full object-cover contrast-125 saturate-125 brightness-105"
              />
            </div>

            {/* Split Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none"
              style={{ left: `${sliderPositionUpscale}%` }}
            />

            {/* Before / After Badges */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-medium text-slate-200 pointer-events-none border border-white/10">
              Before
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-medium text-slate-200 pointer-events-none border border-white/10">
              After
            </div>

            {/* Interactive invisible slider */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPositionUpscale}
              onChange={(e) => setSliderPositionUpscale(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
              title="Drag to compare"
            />
          </div>
        </div>

        {/* Card 3: Depth Map */}
        <div
          onClick={() => onSelectFeature?.("depth-map")}
          className="group bg-[#081220] border border-[#1e3456] hover:border-[#38bdf8]/80 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col cursor-pointer"
        >
          <div className="text-center py-1.5 px-3 bg-[#0a1628] border-b border-[#14233a] text-xs font-semibold text-slate-200">
            Depth Map
          </div>
          <div className="relative h-44 w-full bg-[#0d1522] overflow-hidden flex items-center justify-center">
            {/* Grayscale Depth Map of Trees & Nature matching screenshot */}
            <img
              src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80"
              alt="Depth estimation"
              className="w-full h-full object-cover filter grayscale contrast-200 brightness-75 invert"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#081220]/60 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Card 4: Image Captioning */}
        <div
          onClick={() => onSelectFeature?.("captioning")}
          className="group bg-[#081220] border border-[#1e3456] hover:border-[#38bdf8]/80 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col cursor-pointer relative"
        >
          <div className="text-center py-1.5 px-3 bg-[#0a1628] border-b border-[#14233a] text-xs font-semibold text-slate-200">
            Image Captioning
          </div>
          <div className="relative h-44 w-full overflow-hidden flex flex-col justify-end">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
              alt="Mountain lake"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Caption pill matching screenshot 2 */}
            <div className="relative z-10 m-2.5 p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-center shadow-lg">
              <p className="text-[11px] font-medium text-slate-100 italic leading-snug">
                “A serene mountain lake surrounded by pine trees.”
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Dots matching screenshot 2: ○ ● ○ ○ ○ */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {[0, 1, 2, 3, 4].map((idx) => (
          <button
            key={idx}
            onClick={() => setActiveDot(idx)}
            className={`transition-all rounded-full cursor-pointer ${
              activeDot === idx
                ? "w-2.5 h-2.5 bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.8)] scale-110"
                : "w-2 h-2 bg-slate-600 hover:bg-slate-400"
            }`}
            aria-label={`Showcase slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
