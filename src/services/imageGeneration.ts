import {
  SmartImageEngine,
  type GenerateResult,
  type SmartImageBackend,
  type GenerateOptions,
} from "smart-image-engine";
import {
  exportModelCache,
  downloadModelCache,
  importModelCache,
  getModelCacheSize,
  clearModelCache,
} from "smart-image-engine/cache-tools";

let engineInstance: SmartImageEngine | null = null;
let engineInitPromise: Promise<SmartImageBackend> | null = null;
let currentForceBackend: "webgpu" | "cloud" | undefined = undefined;

export function getSmartImageEngine(
  onProgress?: (status: string, progress?: number) => void,
  forceBackend?: "webgpu" | "cloud",
): SmartImageEngine {
  if (!engineInstance || currentForceBackend !== forceBackend) {
    currentForceBackend = forceBackend;
    engineInitPromise = null;
    engineInstance = new SmartImageEngine({
      forceBackend,
      onProgress: (status, progress) => {
        onProgress?.(status, progress);
      },
    });
  }
  return engineInstance;
}

export async function initSmartImageEngine(
  onProgress?: (status: string, progress?: number) => void,
  forceBackend?: "webgpu" | "cloud",
): Promise<SmartImageBackend> {
  const engine = getSmartImageEngine(onProgress, forceBackend);
  if (engine.isInitialized) {
    return engine.currentBackend;
  }
  if (!engineInitPromise) {
    engineInitPromise = engine.init();
  }
  return engineInitPromise;
}

export interface SmartImageGenerateParams {
  prompt: string;
  width?: number;
  height?: number;
  seed?: number;
  numInferenceSteps?: number;
  forceBackend?: "webgpu" | "cloud";
  onProgress?: (status: string, progress?: number) => void;
}

export async function generateSmartImage(
  params: SmartImageGenerateParams,
): Promise<GenerateResult> {
  const engine = getSmartImageEngine(params.onProgress, params.forceBackend);
  if (!engine.isInitialized) {
    await initSmartImageEngine(params.onProgress, params.forceBackend);
  }

  const options: GenerateOptions = {
    width: params.width ?? 1024,
    height: params.height ?? 1024,
    seed: params.seed ?? Math.floor(Math.random() * 1000000),
    numInferenceSteps: params.numInferenceSteps ?? 1,
  };

  return await engine.generate(params.prompt, options);
}

export {
  exportModelCache,
  downloadModelCache,
  importModelCache,
  getModelCacheSize,
  clearModelCache,
};

export type { GenerateResult, SmartImageBackend };
