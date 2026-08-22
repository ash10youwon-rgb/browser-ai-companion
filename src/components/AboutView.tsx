import React from "react";
import {
  Info,
  Shield,
  Cpu,
  Lock,
  Terminal,
  Zap,
  CheckCircle,
  ExternalLink,
  Globe,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { BroAiLogo } from "./BroAiLogo";

export const AboutView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-screen bg-[#090d16] text-slate-100 overflow-y-auto font-sans p-3 sm:p-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#151f33] max-w-4xl mx-auto w-full gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Info className="h-5 w-5 text-[#38bdf8]" />
            About BroAI Companion
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Private, sovereign AI intelligence executing natively in your web browser.
          </p>
        </div>
        <div className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-mono bg-[#0b1322] border border-[#1b2942] text-[#38bdf8]">
          v2.5.0-WebGPU
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full mt-6 space-y-6 pb-12">
        {/* Hero Card */}
        <div className="bg-[#0e1626] border border-[#1c2a40] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-[#090e18] rounded-2xl border border-[#1c2a40] flex items-center justify-center">
            <BroAiLogo size={64} />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
              BroAI{" "}
              <span className="text-[#38bdf8] text-sm font-semibold uppercase px-2 py-0.5 bg-blue-950/60 rounded-md border border-blue-800/40">
                100% In-Browser AI Workspace
              </span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              BroAI empowers you to run neural vision, language models, image processing, and code
              execution 100% locally inside your web browser via WebGPU and Transformers.js. All
              data remains on your physical machine.
            </p>
          </div>
        </div>

        {/* 100% Privacy vs Real-Time Search Grounding Banner */}
        <div className="bg-gradient-to-r from-[#0b1b33] via-[#0e2242] to-[#0b1b33] border border-[#204070] rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#38bdf8]">
            <Shield className="h-5 w-5 text-emerald-400" />
            <span>100% Browser Privacy & Real-Time Search Architecture</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            Every neural model (LLMs, RMBG background matting, super-resolution-js upscaling, and
            captionify vision descriptors) operates strictly inside client-side WASM and WebGPU
            memory without sending your images or personal chats to remote inference servers.
          </p>
          <div className="flex items-start gap-2 pt-1 text-xs text-slate-300">
            <Globe className="h-4 w-4 text-[#38bdf8] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Selective Internet Grounding:</strong> The only time external network calls
              occur is when you explicitly enable the Google Search Grounding toggle or ask for
              real-time live events (sports scores, weather, stock prices, news). The AI model then
              performs grounded web search to retrieve fresh real-time web citations.
            </span>
          </div>
        </div>

        {/* 3 Open Source Vision Integrations */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#38bdf8]" />
            Integrated Open-Source Computer Vision Repositories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* bg-remove */}
            <div className="bg-[#0e1626] border border-[#1c2a40] hover:border-[#e879f9]/50 rounded-2xl p-4 space-y-2.5 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e879f9]">bg-remove</span>
                <a
                  href="https://github.com/addyosmani/bg-remove"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                By Addy Osmani. In-browser background removal using RMBG-1.4 / MODNet with WebGPU &
                ONNX runtime for alpha boundary extraction.
              </p>
              <div className="text-[10px] font-mono text-slate-400 pt-1">
                Repo: github.com/addyosmani/bg-remove
              </div>
            </div>

            {/* super-resolution-js */}
            <div className="bg-[#0e1626] border border-[#1c2a40] hover:border-[#38bdf8]/50 rounded-2xl p-4 space-y-2.5 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#38bdf8]">super-resolution-js</span>
                <a
                  href="https://github.com/josephrocca/super-resolution-js"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                By Joseph Rocca. Client-side super-resolution with tile-aware memory buffers for 2x
                & 4x neural image upscaling.
              </p>
              <div className="text-[10px] font-mono text-slate-400 pt-1">
                Repo: github.com/josephrocca/super-resolution-js
              </div>
            </div>

            {/* captionify */}
            <div className="bg-[#0e1626] border border-[#1c2a40] hover:border-[#ec4899]/50 rounded-2xl p-4 space-y-2.5 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#ec4899]">captionify</span>
                <a
                  href="https://github.com/jaggedsoft/captionify"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                By JaggedSoft. Vision-to-language caption generator using Transformers.js ViT-GPT2
                and BLIP models 100% on-device.
              </p>
              <div className="text-[10px] font-mono text-slate-400 pt-1">
                Repo: github.com/jaggedsoft/captionify
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0e1626] border border-[#1c2a40] rounded-2xl p-4 space-y-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Absolute Privacy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero telemetry, zero remote inference servers. All weights are downloaded into your
              browser cache and executed in client memory.
            </p>
          </div>

          <div className="bg-[#0e1626] border border-[#1c2a40] rounded-2xl p-4 space-y-2">
            <div className="h-8 w-8 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-[#38bdf8]">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">WebGPU Acceleration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compiled WGSL shader pipelines achieve up to 60+ tokens per second on modern desktop &
              laptop GPUs.
            </p>
          </div>

          <div className="bg-[#0e1626] border border-[#1c2a40] rounded-2xl p-4 space-y-2">
            <div className="h-8 w-8 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Terminal className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Local Code Sandbox</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built-in safe runtime execution sandbox for calculating math, algorithms, matrix
              multiplications, and data transformations.
            </p>
          </div>
        </div>

        {/* Technical Architecture Overview */}
        <div className="bg-[#0e1626] border border-[#1c2a40] rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#38bdf8]" />
            Technical Pipeline & Supported Quantizations
          </h3>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#38bdf8] flex-shrink-0 mt-0.5" />
              <span>
                <strong>FP16 / Q4_F16_1:</strong> High precision 4-bit weight packing with 16-bit
                float activations for near-lossless perplexity.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#38bdf8] flex-shrink-0 mt-0.5" />
              <span>
                <strong>KV Cache Management:</strong> Paged attention tensors dynamically allocated
                within browser VRAM boundaries.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-[#38bdf8] flex-shrink-0 mt-0.5" />
              <span>
                <strong>Transformers.js v3 + ONNX Web:</strong> Full support for in-browser ViT,
                MODNet, DPT-Midas, and WebGPU compute shaders.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
