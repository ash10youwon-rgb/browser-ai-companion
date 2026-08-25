import {
  SmartImageEngine,
  type GenerateResult,
  type SmartImageBackend,
  type GenerateOptions,
} from "smart-image-engine";

let engineInstance: SmartImageEngine | null = null;
let engineInitPromise: Promise<SmartImageBackend> | null = null;

export function getSmartImageEngine(
  onProgress?: (status: string, progress?: number) => void,
): SmartImageEngine {
  if (!engineInstance) {
    engineInstance = new SmartImageEngine({
      onProgress: (status, progress) => {
        onProgress?.(status, progress);
      },
    });
  }
  return engineInstance;
}

export async function initSmartImageEngine(
  onProgress?: (status: string, progress?: number) => void,
): Promise<SmartImageBackend> {
  const engine = getSmartImageEngine(onProgress);
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
  onProgress?: (status: string, progress?: number) => void;
}

export async function generateSmartImage(
  params: SmartImageGenerateParams,
): Promise<GenerateResult> {
  const engine = getSmartImageEngine(params.onProgress);
  if (!engine.isInitialized) {
    await initSmartImageEngine(params.onProgress);
  }

  const options: GenerateOptions = {
    width: params.width ?? 1024,
    height: params.height ?? 1024,
    seed: params.seed ?? Math.floor(Math.random() * 1000000),
    numInferenceSteps: params.numInferenceSteps ?? 1,
  };

  return await engine.generate(params.prompt, options);
}

export type { GenerateResult, SmartImageBackend };
