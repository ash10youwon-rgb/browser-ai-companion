/**
 * In-Browser WebGPU & Local LLM Neural Engine
 *
 * Real client-side AI inference powered by @mlc-ai/web-llm (WebGPU MLC Engine)
 * with graceful fallback to @huggingface/transformers (Transformers.js ONNX).
 */

import * as webllm from "@mlc-ai/web-llm";
import { pipeline, TextStreamer, env } from "@huggingface/transformers";
import { ModelInfo } from "@/types";

// --------------------------------------------------------------------------
// 1. URL Construction Polyfill Guard for iFrames and Sandbox Environments
// --------------------------------------------------------------------------
if (typeof window !== "undefined") {
  const NativeURL = window.URL;

  function sanitizeBase(base: unknown) {
    if (!base || base === "about:blank" || base === "about:srcdoc") {
      return "https://cdn.jsdelivr.net/";
    }
    if (typeof base === "string") {
      if (!base.includes("://") && !base.startsWith("blob:")) {
        return "https://cdn.jsdelivr.net/";
      }
    }
    return base as string;
  }

  class SafeURL extends NativeURL {
    constructor(url: string | URL, base?: string | URL) {
      const safeBase = sanitizeBase(base);
      try {
        super(url, safeBase);
      } catch {
        try {
          super(url, "https://cdn.jsdelivr.net/");
        } catch {
          super(url);
        }
      }
    }
  }

  // Preserve static methods required by WebLLM for Web Workers & WebAssembly
  Object.defineProperty(SafeURL, "createObjectURL", {
    value: function (blob: Blob | MediaSource) {
      return NativeURL.createObjectURL(blob);
    },
    writable: true,
    configurable: true,
  });
  Object.defineProperty(SafeURL, "revokeObjectURL", {
    value: function (url: string) {
      return NativeURL.revokeObjectURL(url);
    },
    writable: true,
    configurable: true,
  });

  try {
    window.URL = SafeURL as unknown as typeof URL;
  } catch (e) {
    console.debug("SafeURL setup notice:", e);
  }
}

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
  maxTokens?: number;
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

// MLC Engine singleton cache
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mlcEngineCache = new Map<string, any>();
let isMLCLoading = false;

// Transformers pipeline cache as backup
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformersCache = new Map<string, any>();
let isTransformersLoading = false;

/**
 * Maps app model IDs to MLC prebuilt model identifiers
 */
export function getMLCModelId(modelId: string): string {
  const id = modelId.toLowerCase();

  if (id.includes("llama-3.2-3b") || id.includes("llama 3.2 3b") || id === "llama-3.2-3b") {
    return "Llama-3.2-3B-Instruct-q4f16_1-MLC";
  }
  if (id.includes("llama-3.2-1b") || id.includes("llama 3.2 1b") || id === "llama-3.2-1b") {
    return "Llama-3.2-1B-Instruct-q4f16_1-MLC";
  }
  if (id.includes("qwen") && (id.includes("0.5b") || id.includes("0-5b"))) {
    return "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
  }
  if (id.includes("qwen") && (id.includes("1.5b") || id.includes("1-5b"))) {
    return "Qwen2.5-1.5B-Instruct-q4f16_1-MLC";
  }
  if (
    id.includes("qwen") &&
    (id.includes("3b") || id.includes("2.5-3b") || id.includes("3-0.6b"))
  ) {
    return "Qwen2.5-3B-Instruct-q4f16_1-MLC";
  }
  if (id.includes("phi-3.5") || id.includes("phi-4") || id.includes("phi")) {
    return "Phi-3.5-mini-instruct-q4f16_1-MLC";
  }
  if (id.includes("gemma")) {
    return "gemma-2-2b-it-q4f16_1-MLC";
  }
  if (id.includes("360m")) {
    return "SmolLM2-360M-Instruct-q4f16_1-MLC";
  }
  if (id.includes("135m")) {
    return "SmolLM2-135M-Instruct-q0f16-MLC";
  }

  // If already an MLC model ID, return as is
  if (modelId.includes("-MLC")) {
    return modelId;
  }

  return "Llama-3.2-1B-Instruct-q4f16_1-MLC";
}

/**
 * Maps app model IDs to accessible ONNX HuggingFace repositories (Transformers fallback)
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

  return { hfRepo: "onnx-community/SmolLM2-135M-Instruct-ONNX-MHA", dtype: "q4" };
}

/**
 * 1. Detect and inspect client WebGPU device hardware
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
 * 2. Get or create MLC WebLLM Engine instance
 */
export async function getOrCreateMLCEngine(
  modelId: string,
  onStatus?: (status: string) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const mlcModel = getMLCModelId(modelId);

  if (mlcEngineCache.has(mlcModel)) {
    return mlcEngineCache.get(mlcModel);
  }

  while (isMLCLoading) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (mlcEngineCache.has(mlcModel)) {
      return mlcEngineCache.get(mlcModel);
    }
  }

  isMLCLoading = true;

  try {
    onStatus?.(`Initializing WebLLM Engine for ${mlcModel}...`);

    const engine = await webllm.CreateMLCEngine(mlcModel, {
      initProgressCallback: (report) => {
        const pct = Math.round((report.progress || 0) * 100);
        onStatus?.(report.text || `Loading model weights (${pct}%)...`);
      },
    });

    mlcEngineCache.set(mlcModel, engine);
    return engine;
  } finally {
    isMLCLoading = false;
  }
}

/**
 * 3. Transformers.js Pipeline fallback (for environments without WebGPU shader support)
 */
async function getOrCreateTransformersPipeline(
  modelId: string,
  onStatus?: (status: string) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const { hfRepo, dtype } = getHuggingFaceModelId(modelId);

  if (transformersCache.has(hfRepo)) {
    return transformersCache.get(hfRepo);
  }

  while (isTransformersLoading) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (transformersCache.has(hfRepo)) {
      return transformersCache.get(hfRepo);
    }
  }

  isTransformersLoading = true;

  try {
    const hasWebGPU = typeof navigator !== "undefined" && "gpu" in navigator;
    const devicePreference = hasWebGPU ? "webgpu" : "wasm";

    onStatus?.(`Downloading & loading ${hfRepo} weights...`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let generator: any = null;
    try {
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

    transformersCache.set(hfRepo, generator);
    return generator;
  } finally {
    isTransformersLoading = false;
  }
}

/**
 * 4. Main Streaming Inference Function
 *
 * Tries WebLLM MLC engine first (as requested in the user code).
 * Gracefully falls back to Transformers.js if WebGPU shader limits are reached.
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
    topP = 0.9,
    maxTokens = 1024,
    searchContext,
    onToken,
    onStatus,
  } = options;

  // Format messages array
  const formattedMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

  if (systemPrompt && systemPrompt.trim()) {
    formattedMessages.push({ role: "system", content: systemPrompt.trim() });
  } else {
    formattedMessages.push({
      role: "system",
      content:
        "You are a helpful, respectful, and honest AI assistant running entirely inside the user's browser via WebGPU.",
    });
  }

  if (messages && messages.length > 0) {
    for (const msg of messages) {
      formattedMessages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  } else {
    formattedMessages.push({
      role: "user",
      content: prompt,
    });
  }

  // --- ATTEMPT 1: WebLLM MLC Engine ---
  try {
    const hasWebGPU = typeof navigator !== "undefined" && "gpu" in navigator;
    if (hasWebGPU) {
      onStatus?.(`Initializing ${model.name} via WebGPU MLC Engine...`);
      const engine = await getOrCreateMLCEngine(model.id, onStatus);

      onStatus?.(`Generating response with ${model.name}...`);

      const completion = await engine.chat.completions.create({
        messages: formattedMessages,
        temperature: Math.max(0.01, temperature),
        top_p: Math.min(1.0, Math.max(0.1, topP)),
        max_tokens: maxTokens,
        stream: true,
      });

      let fullOutput = "";
      let startTime = 0;
      let tokenCount = 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const chunk of completion as any) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (!delta) continue;

        if (tokenCount === 0) {
          startTime = performance.now();
        }
        tokenCount++;
        fullOutput += delta;

        const elapsedSec = startTime > 0 ? (performance.now() - startTime) / 1000 : 0.001;
        const speedTokPerSec = elapsedSec > 0 ? Number((tokenCount / elapsedSec).toFixed(1)) : 0;

        onToken(delta, fullOutput, {
          tokensGenerated: tokenCount,
          speedTokPerSec,
          elapsedSec: Number(elapsedSec.toFixed(2)),
        });
      }

      const totalElapsedSec =
        startTime > 0 ? Number(((performance.now() - startTime) / 1000).toFixed(2)) : 0.5;
      const finalSpeed =
        totalElapsedSec > 0 ? Number((tokenCount / totalElapsedSec).toFixed(1)) : 0;

      return {
        fullText: fullOutput.trim(),
        totalTokens: tokenCount,
        speedTokPerSec: finalSpeed,
        elapsedSec: totalElapsedSec,
        modelUsed: model.id,
        sources: searchContext?.sources,
      };
    }
  } catch (mlcErr) {
    console.warn(
      "WebLLM MLC execution encountered an issue, falling back to Transformers.js:",
      mlcErr,
    );
  }

  // --- ATTEMPT 2: Transformers.js Fallback ---
  onStatus?.(`Running inference via Transformers.js neural engine...`);
  const generator = await getOrCreateTransformersPipeline(model.id, onStatus);

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

  const output = await generator(formattedMessages, {
    max_new_tokens: maxTokens,
    temperature: Math.max(0.1, temperature),
    do_sample: temperature > 0.1,
    top_k: 40,
    streamer,
  });

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

/**
 * 5. Autonomous Agent ReAct Loop
 *
 * Implements the tool-calling Autonomous AI Agent execution from the user's code.
 */
export async function runAutonomousAgentTask(
  task: string,
  modelId: string,
  onStep: (step: {
    cycle: number;
    thought: string;
    action?: string;
    observation?: string;
    finalAnswer?: string;
  }) => void,
  onStatus?: (status: string) => void,
): Promise<string> {
  const engine = await getOrCreateMLCEngine(modelId, onStatus);

  const agentSystemPrompt = `You are a reasoning Autonomous Agent with access to tools.
Tools available:
1. calculator(expression): Evaluates math expressions. Example: calculator("5000 * Math.pow(1 + 0.07, 5)")
2. js_eval(code): Executes Javascript code string.
3. mock_web_search(query): Returns simulated web search context.

Format your responses using exact Thought / Action / Final Answer syntax:
Thought: <reason about what to do>
Action: <tool_name>(<arguments>)
Observation: <result will be fed back>
... (repeat if needed)
Final Answer: <your final answer to the user>`;

  const agentMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: agentSystemPrompt },
    { role: "user", content: `Task: ${task}` },
  ];

  const maxCycles = 5;
  let finalAnswer = "";

  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    onStatus?.(`Agent reasoning cycle ${cycle}/${maxCycles}...`);

    const response = await engine.chat.completions.create({
      messages: agentMessages,
      temperature: 0.2,
      max_tokens: 512,
    });

    const replyText = response.choices[0].message.content || "";
    agentMessages.push({ role: "assistant", content: replyText });

    if (replyText.includes("Final Answer:")) {
      const match = replyText.split("Final Answer:")[1]?.trim() || replyText;
      finalAnswer = match;
      onStep({
        cycle,
        thought: replyText,
        finalAnswer: match,
      });
      break;
    }

    const actionMatch = replyText.match(/Action:\s*([a-zA-Z0-9_]+)\((.*)\)/);
    if (actionMatch) {
      const toolName = actionMatch[1];
      const rawArgs = actionMatch[2].replace(/^["']|["']$/g, "");
      let observation = "";

      if (toolName === "calculator" || toolName === "js_eval") {
        try {
          const evalResult = Function(`"use strict"; return (${rawArgs})`)();
          observation = String(evalResult);
        } catch (e) {
          observation = `Eval Error: ${(e as Error).message}`;
        }
      } else if (toolName === "mock_web_search") {
        observation = `[Search Results for "${rawArgs}"]: Interest rates updated for 2026. Global inflation benchmark is 2.4%.`;
      } else {
        observation = `Unknown tool: ${toolName}`;
      }

      onStep({
        cycle,
        thought: replyText,
        action: `${toolName}(${rawArgs})`,
        observation,
      });

      agentMessages.push({ role: "user", content: `Observation: ${observation}` });
    } else {
      onStep({
        cycle,
        thought: replyText,
      });
      agentMessages.push({
        role: "user",
        content: "Please summarize your thought process and provide the Final Answer:",
      });
    }
  }

  return finalAnswer;
}

/**
 * Checks if a given model ID is already loaded in memory (MLC Engine or Transformers pipeline).
 */
export function isModelLoadedInVRAM(modelId: string): boolean {
  const mlcModel = getMLCModelId(modelId);
  const { hfRepo } = getHuggingFaceModelId(modelId);
  return mlcEngineCache.has(mlcModel) || transformersCache.has(hfRepo);
}

/**
 * Explicitly preloads model weights into client GPU / browser cache.
 */
export async function preloadModelInVRAM(
  modelId: string,
  onProgress?: (pct: number, statusText: string) => void,
): Promise<boolean> {
  const mlcModel = getMLCModelId(modelId);

  // If already in cache
  if (mlcEngineCache.has(mlcModel)) {
    onProgress?.(100, `Model ${mlcModel} already loaded in VRAM`);
    return true;
  }

  onProgress?.(5, `Connecting to WebGPU shaders for ${mlcModel}...`);

  try {
    const engine = await webllm.CreateMLCEngine(mlcModel, {
      initProgressCallback: (report) => {
        const pct = Math.round((report.progress || 0) * 100);
        onProgress?.(pct, report.text || `Loading model weights (${pct}%)...`);
      },
    });

    mlcEngineCache.set(mlcModel, engine);
    onProgress?.(100, `Model ready in WebGPU VRAM!`);
    return true;
  } catch (err) {
    console.warn("MLC preload error, attempting fallback pipeline:", err);
    try {
      await getOrCreateTransformersPipeline(modelId, (status) => {
        onProgress?.(50, status);
      });
      onProgress?.(100, `Model loaded via WebAssembly/WebGPU fallback pipeline.`);
      return true;
    } catch (fallbackErr) {
      console.error("All preload attempts failed:", fallbackErr);
      throw fallbackErr;
    }
  }
}
