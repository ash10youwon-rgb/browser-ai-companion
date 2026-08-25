/**
 * In-Browser WebGPU & Local LLM Neural Engine
 *
 * Real client-side AI inference powered by @huggingface/transformers (Transformers.js)
 * running directly on in-browser WebGPU / WASM SIMD.
 */

import { pipeline, TextStreamer, env } from "@huggingface/transformers";
import { ModelInfo } from "@/types";

// Configure transformers environment for in-browser execution
env.allowLocalModels = false;
if (typeof window !== "undefined") {
  env.useBrowserCache = true;
}

export interface WebGpuHardwareInfo {
  supported: boolean;
  adapterName: string;
  vendor: string;
  architecture: string;
  backend: string;
  maxBufferSizeMb: number;
  maxComputeWorkgroupSize: number;
  vramEstimatedGb: number;
  wgslShaderCompiled: boolean;
}

export interface StreamLLMOptions {
  model: ModelInfo;
  prompt: string;
  providedText?: string;
  messages?: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    imageAttached?: string;
  }>;
  systemPrompt?: string;
  temperature?: number;
  topP?: number;
  searchContext?: { text: string; sources?: Array<{ title: string; uri: string }> };
  onToken: (
    token: string,
    fullText: string,
    telemetry: { tokensGenerated: number; speedTokPerSec: number; elapsedSec: number },
  ) => void;
  onStatus?: (status: string) => void;
}

export interface StreamLLMResult {
  fullText: string;
  totalTokens: number;
  speedTokPerSec: number;
  elapsedSec: number;
  modelUsed: string;
  sources?: Array<{ title: string; uri: string }>;
}

let cachedHardwareInfo: WebGpuHardwareInfo | null = null;

// Pipeline singleton cache to avoid reloading models across chat messages
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pipelineCache = new Map<string, any>();
let isPipelineLoading = false;

/**
 * Maps app model IDs to accessible ONNX HuggingFace repositories
 */
export function getHuggingFaceModelId(modelId: string): { hfRepo: string; dtype: string } {
  const id = modelId.toLowerCase();

  if (id.includes("135m")) {
    return { hfRepo: "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA", dtype: "q4" };
  }
  if (id.includes("360m")) {
    return { hfRepo: "onnx-community/SmolLM2-360M-ONNX", dtype: "q4" };
  }
  if (id.includes("qwen") && id.includes("0.5b")) {
    return { hfRepo: "onnx-community/Qwen2.5-0.5B-Instruct", dtype: "q4" };
  }
  if (id.includes("llama") && id.includes("1b")) {
    return { hfRepo: "onnx-community/Llama-3.2-1B-Instruct", dtype: "q4" };
  }

  // Default to lightweight, instant SmolLM2-135M ONNX
  return { hfRepo: "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA", dtype: "q4" };
}

/**
 * 1. Detect and inspect actual WebGPU device hardware
 */
export async function detectWebGpuHardware(): Promise<WebGpuHardwareInfo> {
  if (cachedHardwareInfo) return cachedHardwareInfo;

  const defaultFallback: WebGpuHardwareInfo = {
    supported: false,
    adapterName: "Browser WebAssembly Engine (WASM SIMD)",
    vendor: "Client Host",
    architecture: "WASM / CPU",
    backend: "WebAssembly CPU",
    maxBufferSizeMb: 512,
    maxComputeWorkgroupSize: 256,
    vramEstimatedGb: 8.0,
    wgslShaderCompiled: false,
  };

  if (typeof navigator === "undefined" || !("gpu" in navigator)) {
    cachedHardwareInfo = defaultFallback;
    return defaultFallback;
  }

  try {
    const gpu = navigator.gpu as GPU;
    const adapter = await gpu.requestAdapter({ powerPreference: "high-performance" });

    if (!adapter) {
      cachedHardwareInfo = defaultFallback;
      return defaultFallback;
    }

    const info =
      (
        adapter as unknown as {
          info?: { vendor?: string; architecture?: string; device?: string; description?: string };
        }
      ).info || {};
    const limits = adapter.limits;

    const maxBufferSizeMb = limits?.maxBufferSize
      ? Math.round(limits.maxBufferSize / (1024 * 1024))
      : 1024;
    const maxWorkgroup = limits?.maxComputeWorkgroupSizeX || 256;

    let wgslCompiled = false;
    try {
      const device = await adapter.requestDevice();
      if (device) {
        const shaderCode = `
          @group(0) @binding(0) var<storage, read> inputVec : array<f32>;
          @group(0) @binding(1) var<storage, read_write> outputVec : array<f32>;

          @compute @workgroup_size(64)
          fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            let idx = global_id.x;
            if (idx < arrayLength(&inputVec)) {
              outputVec[idx] = inputVec[idx] * 1.41421356;
            }
          }
        `;
        const shaderModule = device.createShaderModule({ code: shaderCode });
        if (shaderModule) {
          wgslCompiled = true;
        }
      }
    } catch (shaderErr) {
      console.warn("WebGPU test compute shader compilation check:", shaderErr);
    }

    let adapterName =
      info.description || info.device || info.architecture || "Discrete / Integrated GPU";
    if (adapterName.toLowerCase().includes("apple")) {
      adapterName = "Apple Silicon GPU (Metal / WebGPU)";
    } else if (adapterName.toLowerCase().includes("nvidia")) {
      adapterName = "NVIDIA Tensor Core GPU (WebGPU / D3D12/Vulkan)";
    } else if (
      adapterName.toLowerCase().includes("amd") ||
      adapterName.toLowerCase().includes("radeon")
    ) {
      adapterName = "AMD Radeon GPU (WebGPU / Vulkan)";
    } else if (adapterName.toLowerCase().includes("intel")) {
      adapterName = "Intel Iris / Arc GPU (WebGPU)";
    }

    const hardware: WebGpuHardwareInfo = {
      supported: true,
      adapterName,
      vendor: info.vendor || "WebGPU Device",
      architecture: info.architecture || "WGSL Compute Architecture",
      backend: "WebGPU (WGSL Hardware Accelerated)",
      maxBufferSizeMb,
      maxComputeWorkgroupSize: maxWorkgroup,
      vramEstimatedGb: maxBufferSizeMb >= 2048 ? 16.0 : maxBufferSizeMb >= 1024 ? 8.0 : 4.0,
      wgslShaderCompiled: wgslCompiled,
    };

    cachedHardwareInfo = hardware;
    return hardware;
  } catch (err) {
    console.warn("WebGPU adapter inquiry error:", err);
    cachedHardwareInfo = defaultFallback;
    return defaultFallback;
  }
}

/**
 * Loads or retrieves a cached text-generation pipeline from transformers.js
 */
async function getOrCreatePipeline(
  modelId: string,
  onStatus?: (status: string) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const { hfRepo, dtype } = getHuggingFaceModelId(modelId);

  if (pipelineCache.has(hfRepo)) {
    return pipelineCache.get(hfRepo);
  }

  // Wait if another pipeline load is currently in progress
  while (isPipelineLoading) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (pipelineCache.has(hfRepo)) {
      return pipelineCache.get(hfRepo);
    }
  }

  isPipelineLoading = true;

  try {
    const hasWebGPU = typeof navigator !== "undefined" && "gpu" in navigator;
    const devicePreference = hasWebGPU ? "webgpu" : "wasm";

    onStatus?.(`Downloading & loading ${hfRepo} weights...`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let generator: any = null;

    try {
      // First attempt: with WebGPU device
      generator = await pipeline("text-generation", hfRepo, {
        dtype: dtype as "q4" | "fp32" | "fp16",
        device: devicePreference,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progress_callback: (progress: any) => {
          if (progress.status === "progress" && progress.file) {
            const pct = Math.round(progress.progress || 0);
            const fileName = progress.file.split("/").pop() || progress.file;
            onStatus?.(`Downloading ${fileName} (${pct}%)...`);
          } else if (progress.status === "ready") {
            onStatus?.(`Model weights loaded into memory.`);
          }
        },
      });
    } catch (gpuError) {
      console.warn("WebGPU pipeline initialization fallback to WASM:", gpuError);
      onStatus?.(`Switching to WebAssembly SIMD fallback...`);
      // Fallback: CPU/WASM
      generator = await pipeline("text-generation", hfRepo, {
        dtype: dtype as "q4" | "fp32" | "fp16",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progress_callback: (progress: any) => {
          if (progress.status === "progress" && progress.file) {
            const pct = Math.round(progress.progress || 0);
            const fileName = progress.file.split("/").pop() || progress.file;
            onStatus?.(`Downloading ${fileName} (${pct}%)...`);
          }
        },
      });
    }

    pipelineCache.set(hfRepo, generator);
    return generator;
  } finally {
    isPipelineLoading = false;
  }
}

/**
 * 2. Real In-Browser LLM Inference via Transformers.js
 *
 * Runs authentic autoregressive decode with actual token streaming and
 * precise elapsed tok/s speed calculation.
 */
export async function streamBrowserLLMResponse(
  options: StreamLLMOptions,
): Promise<StreamLLMResult> {
  const {
    model,
    prompt,
    messages,
    systemPrompt,
    temperature = 0.3,
    searchContext,
    onToken,
    onStatus,
  } = options;

  onStatus?.(`Initializing ${model.name} neural pipeline...`);

  const generator = await getOrCreatePipeline(model.id, onStatus);

  onStatus?.(`Generating response with ${model.name}...`);

  // Format chat conversation according to standard chat templates
  const conversation: Array<{ role: string; content: string }> = [];

  if (systemPrompt && systemPrompt.trim()) {
    conversation.push({ role: "system", content: systemPrompt.trim() });
  } else {
    conversation.push({
      role: "system",
      content: "You are a helpful, direct, and concise AI assistant running locally.",
    });
  }

  if (messages && messages.length > 0) {
    for (const msg of messages) {
      conversation.push({
        role: msg.role,
        content: msg.content,
      });
    }
  } else {
    conversation.push({
      role: "user",
      content: prompt,
    });
  }

  let accumulatedText = "";
  let tokenCount = 0;
  let startTime = 0;

  const streamer = new TextStreamer(generator.tokenizer, {
    skip_prompt: true,
    callback_function: (rawToken: string) => {
      if (tokenCount === 0) {
        startTime = performance.now();
      }
      tokenCount++;
      accumulatedText += rawToken;

      const elapsedSec = startTime > 0 ? (performance.now() - startTime) / 1000 : 0.001;
      const speedTokPerSec = elapsedSec > 0 ? Number((tokenCount / elapsedSec).toFixed(1)) : 0;

      onToken(rawToken, accumulatedText, {
        tokensGenerated: tokenCount,
        speedTokPerSec,
        elapsedSec: Number(elapsedSec.toFixed(2)),
      });
    },
  });

  const output = await generator(conversation, {
    max_new_tokens: 512,
    temperature: Math.max(0.1, temperature),
    do_sample: temperature > 0.1,
    top_k: 40,
    streamer,
  });

  // Extract raw text generated by model
  let finalRawText = accumulatedText;
  if (!finalRawText && output && output.length > 0) {
    const genResult = output[0]?.generated_text;
    if (Array.isArray(genResult)) {
      const lastMessage = genResult[genResult.length - 1];
      finalRawText = lastMessage?.content || "";
    } else if (typeof genResult === "string") {
      finalRawText = genResult;
    }
  }

  // Strip potential trailing special tokens (<|im_end|>, </s>, etc.) if any remain
  finalRawText = finalRawText
    .replace(/<\|im_end\|>$/, "")
    .replace(/<\|endoftext\|>$/, "")
    .replace(/<\/s>$/, "")
    .trim();

  const totalElapsedSec =
    startTime > 0 ? Number(((performance.now() - startTime) / 1000).toFixed(2)) : 0.5;
  const finalSpeed = totalElapsedSec > 0 ? Number((tokenCount / totalElapsedSec).toFixed(1)) : 0;

  return {
    fullText: finalRawText,
    totalTokens: tokenCount,
    speedTokPerSec: finalSpeed,
    elapsedSec: totalElapsedSec,
    modelUsed: model.id,
    sources: searchContext?.sources,
  };
}
