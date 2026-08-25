import { ModelInfo, AppSettings, WebGpuStats } from "@/types";

export const INITIAL_MODELS: ModelInfo[] = [
  // --- Micro & Instant Models ---
  {
    id: "smollm2-135m",
    name: "SmolLM2-135M",
    family: "Hugging Face",
    category: "Micro & Instant Models",
    dropdownLabel: "SmolLM2-135M — instant · ~270 MB",
    size: "270 MB",
    vram: "350 MB",
    speed: "112.0 tok/s",
    quantization: "q4f16_0",
    contextWindow: "4,096",
    description:
      "Instant microscopic model for instant token completions and ultra-low latency on any device.",
    loaded: false,
    tags: ["Instant", "Micro", "~270 MB"],
  },
  {
    id: "smollm2-360m",
    name: "SmolLM2-360M",
    family: "Hugging Face",
    category: "Micro & Instant Models",
    dropdownLabel: "SmolLM2-360M — better chat · ~380 MB",
    size: "380 MB",
    vram: "480 MB",
    speed: "96.5 tok/s",
    quantization: "q4f16_0",
    contextWindow: "4,096",
    description:
      "Compact conversational model tuned for snappy chat interactions with minimal memory overhead.",
    loaded: false,
    tags: ["Better Chat", "Micro", "~380 MB"],
  },
  {
    id: "qwen-2.5-0.5b",
    name: "Qwen 2.5 0.5B",
    family: "Alibaba Qwen",
    category: "Micro & Instant Models",
    dropdownLabel: "Qwen 2.5 0.5B — fast multilingual · ~350–500 MB",
    size: "390 MB",
    vram: "520 MB",
    speed: "88.4 tok/s",
    quantization: "q4f16_1",
    contextWindow: "32,768",
    description:
      "Fast multilingual foundation model supporting 29+ languages in under 500 MB footprint.",
    loaded: false,
    tags: ["Fast Multilingual", "Micro", "~350–500 MB"],
  },
  {
    id: "bonsai-1.7b-1bit",
    name: "Bonsai 1.7B (1-bit)",
    family: "Bonsai AI",
    category: "Micro & Instant Models",
    dropdownLabel: "Bonsai 1.7B (1-bit) — experimental · ~290 MB (fallback)",
    size: "290 MB",
    vram: "390 MB",
    speed: "105.0 tok/s",
    quantization: "1-bit ternary",
    contextWindow: "8,192",
    description:
      "Experimental 1-bit quantized model delivering high parameter capacity at microscopic binary weights.",
    loaded: false,
    tags: ["1-bit", "Experimental", "Fallback"],
  },

  // --- Fast & Light Models ---
  {
    id: "qwen-2.5-0.5b-fp16",
    name: "Qwen 2.5 0.5B (fp16)",
    family: "Alibaba Qwen",
    category: "Fast & Light Models",
    dropdownLabel: "Qwen 2.5 0.5B (fp16) · ~1.0 GB",
    size: "1.0 GB",
    vram: "1.3 GB",
    speed: "74.2 tok/s",
    quantization: "fp16",
    contextWindow: "32,768",
    description:
      "Unquantized half-precision 16-bit float model for maximal mathematical fidelity and fluency.",
    loaded: false,
    tags: ["FP16", "High Precision", "~1.0 GB"],
  },
  {
    id: "qwen-3-0.6b",
    name: "Qwen 3 0.6B",
    family: "Alibaba Qwen",
    category: "Fast & Light Models",
    dropdownLabel: "Qwen 3 0.6B (Qwen 3.5 class) · ~0.6 GB",
    size: "0.6 GB",
    vram: "0.85 GB",
    speed: "82.0 tok/s",
    quantization: "q4f16_1",
    contextWindow: "32,768",
    description:
      "Next-gen Qwen 3.5 architecture condensed into 600M parameters for fast local reasoning.",
    loaded: false,
    tags: ["Qwen 3.5 class", "Fast & Light", "~0.6 GB"],
  },
  {
    id: "gemma-3n-2b",
    name: "Gemma 3n / Gemma 2B IT",
    family: "Google",
    category: "Fast & Light Models",
    dropdownLabel: "Gemma 3n / Gemma 2B IT · ~1.6 GB",
    size: "1.6 GB",
    vram: "2.1 GB",
    speed: "48.6 tok/s",
    quantization: "q4f32_1",
    contextWindow: "8,192",
    description:
      "Google's lightweight instruction-tuned open model tailored for on-device reasoning and text generation.",
    loaded: false,
    tags: ["Google", "Instruction", "~1.6 GB"],
  },
  {
    id: "smollm2-1.7b-instruct",
    name: "SmolLM2 1.7B Instruct",
    family: "Hugging Face",
    category: "Fast & Light Models",
    dropdownLabel: "SmolLM2 1.7B Instruct · ~1.1 GB",
    size: "1.1 GB",
    vram: "1.5 GB",
    speed: "65.2 tok/s",
    quantization: "q4f16_0",
    contextWindow: "4,096",
    description:
      "Synthetic data-trained 1.7B parameter model with impressive common-sense reasoning and tool syntax.",
    loaded: false,
    tags: ["Hugging Face", "Low VRAM", "~1.1 GB"],
  },
  {
    id: "llama-3.2-1b-instruct",
    name: "Llama 3.2 1B Instruct",
    family: "Meta AI",
    category: "Fast & Light Models",
    dropdownLabel: "Llama 3.2 1B Instruct · ~0.9 GB",
    size: "0.9 GB",
    vram: "1.2 GB",
    speed: "72.4 tok/s",
    quantization: "q4f16_0",
    contextWindow: "131,072",
    description:
      "Meta's smallest 1B model with full 128k context support and rapid in-browser inference.",
    loaded: false,
    tags: ["Meta AI", "128k Context", "~0.9 GB"],
  },

  // --- Mid & Logic Models ---
  {
    id: "llama-3.2-3b-instruct",
    name: "Llama 3.2 3B Instruct",
    family: "Meta AI",
    category: "Mid & Logic Models",
    dropdownLabel: "Llama 3.2 3B Instruct · ~2.2 GB",
    size: "2.2 GB",
    vram: "2.8 GB",
    speed: "42.1 tok/s",
    quantization: "q4f16_0",
    contextWindow: "131,072",
    description:
      "Flagship lightweight instruction model from Meta, great for quick summaries and multi-turn chats.",
    loaded: false,
    tags: ["Meta AI", "Mid & Logic", "~2.2 GB"],
  },
  {
    id: "smollm3-3b",
    name: "SmolLM3 3B",
    family: "Hugging Face",
    category: "Mid & Logic Models",
    dropdownLabel: "SmolLM3 3B · ~2.0 GB (fallback)",
    size: "2.0 GB",
    vram: "2.6 GB",
    speed: "45.0 tok/s",
    quantization: "q4f16_1",
    contextWindow: "8,192",
    description:
      "Next-generation 3B distilled model with comprehensive structured JSON and markdown parsing.",
    loaded: false,
    tags: ["Hugging Face", "Fallback", "~2.0 GB"],
  },
  {
    id: "phi-3.5-mini-instruct",
    name: "Phi-3.5 Mini Instruct",
    family: "Microsoft",
    category: "Mid & Logic Models",
    dropdownLabel: "Phi-3.5 Mini Instruct · ~2.4 GB",
    size: "2.4 GB",
    vram: "3.0 GB",
    speed: "38.5 tok/s",
    quantization: "q4f16_1",
    contextWindow: "128,000",
    description:
      "Microsoft's 3.8B parameter logic engine with high-grade multi-lingual and 128k long-context capabilities.",
    loaded: false,
    tags: ["Microsoft", "Math & Logic", "~2.4 GB"],
  },
  {
    id: "phi-4-mini-instruct",
    name: "Phi-4 Mini Instruct",
    family: "Microsoft",
    category: "Mid & Logic Models",
    dropdownLabel: "Phi-4 Mini Instruct · ~2.6 GB",
    size: "2.6 GB",
    vram: "3.2 GB",
    speed: "36.0 tok/s",
    quantization: "q4f16_1",
    contextWindow: "128,000",
    description:
      "State-of-the-art synthetic reasoning model from Microsoft with complex algorithmic problem solving.",
    loaded: false,
    tags: ["Microsoft", "Reasoning", "~2.6 GB"],
  },
  {
    id: "qwen-2.5-3b-instruct",
    name: "Qwen 2.5 3B Instruct",
    family: "Alibaba Qwen",
    category: "Mid & Logic Models",
    dropdownLabel: "Qwen 2.5 3B Instruct · ~2.1 GB",
    size: "2.1 GB",
    vram: "2.7 GB",
    speed: "44.8 tok/s",
    quantization: "q4f16_1",
    contextWindow: "32,768",
    description:
      "Balanced 3B multilingual model specialized in code generation, mathematics, and instruction adherence.",
    loaded: false,
    tags: ["Alibaba Qwen", "Coding", "~2.1 GB"],
  },

  // --- Flagship & Reasoning Models ---
  {
    id: "qwen-2.5-7b",
    name: "Qwen 2.5 7B Instruct",
    family: "Alibaba Qwen",
    category: "Flagship & Reasoning Models",
    dropdownLabel: "Qwen 2.5 7B Instruct · ~4.4 GB",
    size: "4.4 GB",
    vram: "5.2 GB",
    speed: "28.4 tok/s",
    quantization: "q4f16_1",
    contextWindow: "32,768",
    description:
      "Premier multilingual reasoning & coding model, optimized for local browser execution via WebGPU.",
    loaded: true,
    tags: ["Coding", "Reasoning", "Flagship"],
  },
  {
    id: "deepseek-r1-8b",
    name: "DeepSeek R1 Distill Qwen 8B",
    family: "DeepSeek",
    category: "Flagship & Reasoning Models",
    dropdownLabel: "DeepSeek R1 Distill Qwen 8B · ~4.9 GB",
    size: "4.9 GB",
    vram: "5.8 GB",
    speed: "22.8 tok/s",
    quantization: "q4f16_1",
    contextWindow: "65,536",
    description: "State-of-the-art chain-of-thought mathematical and analytical reasoning model.",
    loaded: false,
    tags: ["Deep Thinking", "Math", "Flagship"],
  },
];

export const INITIAL_GPU_STATS: WebGpuStats = {
  active: true,
  deviceName: "WebGPU (DirectX 12 / Metal Core)",
  memoryUsedGb: 2.8,
  memoryTotalGb: 8.0,
  tokensPerSec: 28.4,
  temperatureC: 62,
  driverVersion: "Vulkan / WGSL Shader 1.4",
  backend: "Dawn / Chromium Native",
};

export const INITIAL_SETTINGS: AppSettings = {
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2048,
  systemPrompt:
    "You are BroAI, an intelligent, private, in-browser AI companion running locally on the user GPU via WebGPU. Be concise, direct, helpful and knowledgeable.",
  streamingSpeed: 85,
  theme: "dark",
  reduceMotion: false,
  soundEffects: true,
  autoSaveHistory: true,
  selectedGpu: "Dedicated GPU (NVIDIA / Apple Silicon / AMD)",
};

export const QUICK_SUGGESTIONS = [
  "Explain quantum computing",
  "Write a Python function",
  "Summarize this article",
  "Plan a workout routine",
];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: "msg-1",
    role: "user" as const,
    content: "👋 Hey BroAI, how are you?",
    timestamp: Date.now() - 60000,
  },
  {
    id: "msg-2",
    role: "assistant" as const,
    content:
      "Hello! I'm running locally in your browser using your GPU. I'm fast, private, and always here to help. What would you like to explore today?",
    timestamp: Date.now() - 58000,
    speedTokPerSec: 28.4,
    durationSec: 1.2,
    modelUsed: "qwen-2.5-7b",
  },
];

export const KNOWLEDGE_BASE_RESPONSES: Record<string, string> = {
  "explain quantum computing": `### Quantum Computing Explained

Quantum computing leverages the bizarre principles of quantum mechanics to solve complex computations exponentially faster than classical supercomputers.

#### 1. Classical Bits vs. Quantum Qubits
- **Classical Bit:** Can only exist in a state of **0** or **1** (like a standard light switch).
- **Qubit (Quantum Bit):** Can exist in a **superposition** of both 0 and 1 simultaneously (like a spinning coin before it lands).

#### 2. Core Principles
- **Superposition:** Allows a system of $n$ qubits to represent $2^n$ states simultaneously.
- **Entanglement:** Qubits become linked such that the state of one instantaneously determines the state of another, regardless of distance.
- **Interference:** Amplifies correct computational paths while cancelling out incorrect ones.

#### 3. Real-World Applications
1. **Cryptography:** Post-quantum encryption & factoring large prime numbers.
2. **Molecular Simulation:** Accelerating drug discovery and battery chemistry.
3. **Logistics Optimization:** Finding global minimums in complex supply chain networks.`,

  "write a python function": `Here is a high-performance Python function with type hints, docstrings, and error handling for finding the moving average of a time-series dataset:

\`\`\`python
from typing import List, Sequence

def calculate_moving_average(data: Sequence[float], window_size: int) -> List[float]:
    """
    Calculate the simple moving average (SMA) of a numerical sequence.
    
    Args:
        data: Sequence of numerical values (integers or floats).
        window_size: The number of periods to average over (must be > 0).
        
    Returns:
        A list of moving average values of length len(data) - window_size + 1.
        
    Raises:
        ValueError: If window_size is <= 0 or larger than data length.
    """
    if window_size <= 0:
        raise ValueError("Window size must be a positive integer.")
    if window_size > len(data):
        raise ValueError("Window size cannot exceed data length.")

    moving_averages: List[float] = []
    current_window_sum = sum(data[:window_size])
    moving_averages.append(round(current_window_sum / window_size, 4))

    # Slide the window across the dataset efficiently in O(N) time
    for i in range(window_size, len(data)):
        current_window_sum += data[i] - data[i - window_size]
        moving_averages.append(round(current_window_sum / window_size, 4))

    return moving_averages

# Example execution:
prices = [10.5, 11.2, 11.8, 12.4, 12.1, 13.0, 13.5]
print("3-period SMA:", calculate_moving_average(prices, window_size=3))
# Output: [11.1667, 11.8, 12.1, 12.5, 12.8667]
\`\`\``,

  "summarize this article": `### Article Summary & Key Takeaways

Please paste or attach the specific article text or URL! In the meantime, here is a structured template showing how BroAI analyzes articles with 0% data egress:

1. **Core Thesis:** The foundational argument or discovery presented by the author.
2. **Key Supporting Evidence:**
   - Primary empirical findings or quantitative metrics.
   - Case studies and historical comparisons.
3. **Strategic Implications:** How this affects industry leaders, engineers, or everyday users.
4. **Actionable Takeaways:** Immediate next steps and questions to consider.

*Tip: You can attach a document or paste raw text straight into the input below to get an instant local summary.*`,

  "plan a workout routine": `### 4-Day Upper / Lower Strength & Hypertrophy Routine

Here is a balanced, science-backed 4-day workout split designed for progressive overload and optimal muscle recovery:

| Day | Focus | Primary Movements | Sets x Reps |
| :--- | :--- | :--- | :--- |
| **Day 1** | Upper (Strength) | Barbell Bench Press, Barbell Row, Overhead Press | 4 x 6-8 |
| **Day 2** | Lower (Strength) | Barbell Back Squat, Romanian Deadlift, Standing Calf Raise | 4 x 6-8 |
| **Day 3** | Rest / Active Recovery | Mobility work, 30 min zone 2 brisk walking | - |
| **Day 4** | Upper (Hypertrophy) | Incline Dumbbell Press, Lat Pulldown, Cable Lateral Raises | 3 x 10-12 |
| **Day 5** | Lower (Hypertrophy) | Bulgarian Split Squats, Leg Press, Hamstring Curls | 3 x 10-15 |
| **Day 6-7**| Rest & Recovery | Hydration, high-protein nutrition, sleep | - |

#### Recovery Guidelines
- **Rest Between Sets:** 2-3 minutes for heavy compound lifts, 60-90 seconds for isolation.
- **Progressive Overload:** Increase weight or reps whenever you hit the top of the target rep range with clean form.`,
};
