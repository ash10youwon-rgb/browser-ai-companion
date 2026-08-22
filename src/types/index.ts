export type TabType =
  "chat" | "image-lab" | "models" | "code-sandbox" | "settings" | "history" | "about";

export interface ModelInfo {
  id: string;
  name: string;
  family: string;
  category:
    | "Micro & Instant Models"
    | "Fast & Light Models"
    | "Mid & Logic Models"
    | "Flagship & Reasoning Models";
  dropdownLabel: string;
  size: string;
  vram: string;
  speed: string;
  quantization: string;
  contextWindow: string;
  description: string;
  loaded: boolean;
  downloadProgress?: number;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  speedTokPerSec?: number;
  durationSec?: number;
  modelUsed?: string;
  thumbsUp?: boolean;
  thumbsDown?: boolean;
  codeSnippets?: { language: string; code: string }[];
  webSearchUsed?: boolean;
  imageAttached?: string;
  sources?: { title: string; uri: string }[];
}

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface WebGpuStats {
  active: boolean;
  deviceName: string;
  memoryUsedGb: number;
  memoryTotalGb: number;
  tokensPerSec: number;
  temperatureC: number;
  driverVersion: string;
  backend: string;
}

export interface AppSettings {
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
  streamingSpeed: number; // 0 (instant) to 100 (smooth)
  theme: "dark" | "oled" | "light";
  reduceMotion: boolean;
  soundEffects: boolean;
  autoSaveHistory: boolean;
  selectedGpu: string;
}
