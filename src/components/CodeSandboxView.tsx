import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  CodeXml,
  Zap,
  Download,
  Eye,
  Columns,
  Rows,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  ExternalLink,
  Trash2,
  Maximize2,
  Minimize2,
  FileCode,
  Paintbrush,
  Cpu,
  Layers,
  Wand2,
} from "lucide-react";

interface CodeSandboxViewProps {
  initialCode?: string;
}

type EditorTab = "html" | "css" | "js" | "console";
type SandboxMode = "frontend" | "benchmark";
type LayoutMode = "split-horizontal" | "split-vertical" | "triple-column" | "preview-only";
type DeviceMode = "desktop" | "tablet" | "mobile";

interface ConsoleLog {
  id: string;
  level: "log" | "warn" | "error";
  message: string;
  time: string;
}

// Preset Showcases for Frontend Studio
const FRONTEND_TEMPLATES = [
  {
    id: "galaxy",
    name: "🪐 Particle Galaxy (Canvas)",
    desc: "Interactive gravitational cosmic particle field responding to mouse physics.",
    html: `<div class="container">
  <canvas id="canvas"></canvas>
  <div class="hud">
    <h1>BroAI Cosmic Core</h1>
    <p>Move your cursor to attract stellar particles</p>
    <div class="stats" id="particle-count">Particles: 600</div>
  </div>
</div>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  background: #05070d;
  color: #f1f5f9;
  font-family: system-ui, -apple-system, sans-serif;
  overflow: hidden;
  height: 100vh;
}
.container {
  position: relative;
  width: 100vw;
  height: 100vh;
}
#canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.hud {
  position: absolute;
  top: 24px;
  left: 24px;
  pointer-events: none;
  background: rgba(10, 17, 30, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
h1 {
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
p {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 4px;
}
.stats {
  margin-top: 8px;
  font-family: monospace;
  font-size: 0.75rem;
  color: #38bdf8;
}`,
    js: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const mouse = { x: width / 2, y: height / 2, active: false };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});
window.addEventListener('mouseleave', () => { mouse.active = false; });

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.radius = Math.random() * 2 + 0.8;
    this.color = ['#38bdf8', '#818cf8', '#c084fc', '#34d399'][Math.floor(Math.random() * 4)];
    this.mass = Math.random() * 1.5 + 0.5;
  }
  update() {
    if (mouse.active) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 280 && dist > 5) {
        const force = (280 - dist) / 280 * 0.4;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }
    }
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.985;
    this.vy *= 0.985;

    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

const particles = Array.from({ length: 280 }, () => new Particle());

function animate() {
  ctx.fillStyle = 'rgba(5, 7, 13, 0.2)';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < particles.length; i++) {
    const p1 = particles[i];
    p1.update();
    p1.draw();

    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 65) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = \`rgba(56, 189, 248, \${(1 - dist / 65) * 0.25})\`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animate);
}
console.log("Galaxy particle engine initialized on canvas.");
animate();`,
  },
  {
    id: "cube3d",
    name: "🧊 3D Holographic Cube",
    desc: "Pure CSS 3D matrix transformation with interactive axis rotation.",
    html: `<div class="viewport">
  <div class="controls">
    <h2>3D Spatial Matrix</h2>
    <div class="control-row">
      <label>Rotate X: <span id="val-x">25</span>°</label>
      <input type="range" id="slider-x" min="-180" max="180" value="25">
    </div>
    <div class="control-row">
      <label>Rotate Y: <span id="val-y">45</span>°</label>
      <input type="range" id="slider-y" min="-180" max="180" value="45">
    </div>
    <div class="control-row">
      <label>Perspective: <span id="val-p">800</span>px</label>
      <input type="range" id="slider-p" min="300" max="1500" value="800">
    </div>
  </div>

  <div class="scene" id="scene">
    <div class="cube" id="cube">
      <div class="face front">BroAI</div>
      <div class="face back">WebGPU</div>
      <div class="face right">Fast</div>
      <div class="face left">Secure</div>
      <div class="face top">Local</div>
      <div class="face bottom">Private</div>
    </div>
  </div>
</div>`,
    css: `body {
  margin: 0;
  background: #080c16;
  color: #fff;
  font-family: system-ui, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
}
.viewport {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}
.controls {
  background: #0d1527;
  border: 1px solid #1e293b;
  padding: 16px 24px;
  border-radius: 16px;
  width: 320px;
}
.controls h2 {
  font-size: 1rem;
  color: #38bdf8;
  margin-bottom: 12px;
}
.control-row {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.control-row label {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
}
input[type=range] {
  accent-color: #38bdf8;
}
.scene {
  width: 200px;
  height: 200px;
  perspective: 800px;
}
.cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(25deg) rotateY(45deg);
  transition: transform 0.1s ease-out;
}
.face {
  position: absolute;
  width: 200px;
  height: 200px;
  border: 2px solid rgba(56, 189, 248, 0.8);
  background: rgba(14, 165, 233, 0.15);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: bold;
  color: #e0f2fe;
  box-shadow: inset 0 0 30px rgba(56, 189, 248, 0.3);
}
.front  { transform: rotateY(  0deg) translateZ(100px); }
.back   { transform: rotateY(180deg) translateZ(100px); }
.right  { transform: rotateY( 90deg) translateZ(100px); }
.left   { transform: rotateY(-90deg) translateZ(100px); }
.top    { transform: rotateX( 90deg) translateZ(100px); }
.bottom { transform: rotateX(-90deg) translateZ(100px); }`,
    js: `const cube = document.getElementById('cube');
const scene = document.getElementById('scene');
const sliderX = document.getElementById('slider-x');
const sliderY = document.getElementById('slider-y');
const sliderP = document.getElementById('slider-p');

const valX = document.getElementById('val-x');
const valY = document.getElementById('val-y');
const valP = document.getElementById('val-p');

function updateTransform() {
  const x = sliderX.value;
  const y = sliderY.value;
  const p = sliderP.value;

  valX.textContent = x;
  valY.textContent = y;
  valP.textContent = p;

  scene.style.perspective = \`\${p}px\`;
  cube.style.transform = \`rotateX(\${x}deg) rotateY(\${y}deg)\`;
}

sliderX.addEventListener('input', updateTransform);
sliderY.addEventListener('input', updateTransform);
sliderP.addEventListener('input', updateTransform);

// Auto continuous subtle rotation
let autoRot = 45;
setInterval(() => {
  if (document.activeElement !== sliderY) {
    autoRot = (autoRot + 0.3) % 360;
    sliderY.value = Math.round(autoRot);
    updateTransform();
  }
}, 30);
console.log("3D CSS matrix renderer active.");`,
  },
  {
    id: "cyberpunk",
    name: "⚡ Cyberpunk HUD & Audio Synth",
    desc: "Futuristic holographic UI with interactive radar and Web Audio synthesizer.",
    html: `<div class="cyber-container">
  <div class="header">
    <div class="status-indicator">SYSTEM ONLINE</div>
    <div class="coords">LOCAL_NODE // PORT_3000</div>
  </div>

  <div class="radar-box">
    <div class="radar-sweep"></div>
    <div class="blip b1"></div>
    <div class="blip b2"></div>
    <div class="blip b3"></div>
    <div class="crosshair"></div>
  </div>

  <div class="actions">
    <button id="btn-beep" class="cyber-btn">🔊 SYNTHESIZE PULSE</button>
    <button id="btn-scan" class="cyber-btn secondary">RADAR PING</button>
  </div>

  <div id="log-box" class="cyber-log">
    > Core WebGPU modules active...<br>
    > Audio context ready.<br>
  </div>
</div>`,
    css: `body {
  margin: 0;
  background: #040810;
  color: #00ffcc;
  font-family: 'Courier New', Courier, monospace;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.cyber-container {
  background: #08111e;
  border: 2px solid #00ffcc;
  border-radius: 12px;
  padding: 24px;
  width: 360px;
  box-shadow: 0 0 25px rgba(0, 255, 204, 0.25);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  border-bottom: 1px solid #133340;
  padding-bottom: 8px;
}
.status-indicator {
  color: #00ffcc;
  font-weight: bold;
}
.coords {
  color: #0088aa;
}
.radar-box {
  width: 180px;
  height: 180px;
  margin: 0 auto;
  border-radius: 50%;
  border: 1px solid #00ffcc;
  background: radial-gradient(circle, rgba(0,255,204,0.05) 0%, rgba(0,0,0,0.8) 100%);
  position: relative;
  overflow: hidden;
}
.crosshair {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background: rgba(0,255,204,0.3);
}
.radar-box::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: 100%;
  background: rgba(0,255,204,0.3);
}
.radar-sweep {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90px;
  height: 90px;
  background: linear-gradient(45deg, rgba(0,255,204,0.8), transparent 70%);
  transform-origin: top left;
  animation: sweep 3s linear infinite;
}
@keyframes sweep {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.blip {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #ff0055;
  border-radius: 50%;
  box-shadow: 0 0 8px #ff0055;
  animation: pulse 1.5s infinite;
}
.b1 { top: 40px; left: 60px; }
.b2 { top: 120px; left: 130px; }
.b3 { top: 70px; left: 140px; }
@keyframes pulse {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.3); }
}
.actions {
  display: flex;
  gap: 8px;
}
.cyber-btn {
  flex: 1;
  background: #00ffcc;
  color: #040810;
  border: none;
  padding: 10px;
  font-weight: bold;
  font-family: inherit;
  font-size: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
}
.cyber-btn:hover {
  background: #80ffe5;
  box-shadow: 0 0 15px #00ffcc;
}
.cyber-btn.secondary {
  background: transparent;
  color: #00ffcc;
  border: 1px solid #00ffcc;
}
.cyber-log {
  background: #040810;
  padding: 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  color: #70b8a8;
  height: 60px;
  overflow-y: auto;
  border: 1px solid #133340;
}`,
    js: `const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const logBox = document.getElementById('log-box');

function appendLog(msg) {
  const line = document.createElement('div');
  line.textContent = '> ' + msg;
  logBox.appendChild(line);
  logBox.scrollTop = logBox.scrollHeight;
  console.log(msg);
}

function playTone(freq, type = 'sine', duration = 0.15) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

document.getElementById('btn-beep').addEventListener('click', () => {
  playTone(880, 'triangle', 0.2);
  setTimeout(() => playTone(1320, 'sine', 0.15), 100);
  appendLog("Synthesized dual-band acoustic beacon.");
});

document.getElementById('btn-scan').addEventListener('click', () => {
  playTone(440, 'sawtooth', 0.3);
  appendLog("Radar sweep triggered: 3 telemetry echoes.");
});
console.log("HUD initialized with Web Audio API.");`,
  },
  {
    id: "calculator",
    name: "🧮 Glassmorphic Calculator",
    desc: "Responsive tactile calculator with animated feedback and key events.",
    html: `<div class="calc-card">
  <div class="display">
    <div id="prev-op" class="prev-op"></div>
    <div id="curr-val" class="curr-val">0</div>
  </div>
  <div class="keys">
    <button class="key op" data-action="clear">AC</button>
    <button class="key op" data-action="delete">DEL</button>
    <button class="key op" data-action="percent">%</button>
    <button class="key op active" data-action="divide">÷</button>
    <button class="key num">7</button>
    <button class="key num">8</button>
    <button class="key num">9</button>
    <button class="key op active" data-action="multiply">×</button>
    <button class="key num">4</button>
    <button class="key num">5</button>
    <button class="key num">6</button>
    <button class="key op active" data-action="subtract">−</button>
    <button class="key num">1</button>
    <button class="key num">2</button>
    <button class="key num">3</button>
    <button class="key op active" data-action="add">+</button>
    <button class="key num zero">0</button>
    <button class="key num">.</button>
    <button class="key equals" data-action="equals">=</button>
  </div>
</div>`,
    css: `body {
  margin: 0;
  background: #090d16;
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.calc-card {
  background: rgba(18, 27, 45, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 24px;
  padding: 24px;
  width: 320px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}
.display {
  background: rgba(10, 15, 26, 0.8);
  border-radius: 16px;
  padding: 16px;
  text-align: right;
  margin-bottom: 20px;
  border: 1px solid rgba(255,255,255,0.05);
}
.prev-op {
  font-size: 0.85rem;
  color: #94a3b8;
  min-height: 18px;
}
.curr-val {
  font-size: 2.2rem;
  font-weight: 700;
  color: #38bdf8;
  overflow: hidden;
  text-overflow: ellipsis;
}
.keys {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.key {
  border: none;
  background: rgba(255,255,255,0.06);
  color: #e2e8f0;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 16px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.key:hover {
  background: rgba(255,255,255,0.12);
  transform: translateY(-2px);
}
.key:active {
  transform: scale(0.94);
}
.key.op {
  color: #a5b4fc;
}
.key.op.active {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
}
.key.equals {
  background: #0284c7;
  color: #fff;
}
.key.equals:hover {
  background: #0369a1;
  box-shadow: 0 0 15px rgba(56,189,248,0.4);
}
.zero {
  grid-column: span 2;
}`,
    js: `let curr = '0';
let prev = '';
let op = null;

const currEl = document.getElementById('curr-val');
const prevEl = document.getElementById('prev-op');

function updateDisplay() {
  currEl.textContent = curr;
  prevEl.textContent = op && prev ? \`\${prev} \${op}\` : '';
}

document.querySelectorAll('.key.num').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.textContent;
    if (val === '.' && curr.includes('.')) return;
    if (curr === '0' && val !== '.') curr = val;
    else curr += val;
    updateDisplay();
  });
});

document.querySelectorAll('.key.op').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    if (action === 'clear') {
      curr = '0'; prev = ''; op = null;
    } else if (action === 'delete') {
      curr = curr.length > 1 ? curr.slice(0, -1) : '0';
    } else if (action === 'percent') {
      curr = String(parseFloat(curr) / 100);
    } else {
      op = btn.textContent;
      prev = curr;
      curr = '0';
    }
    updateDisplay();
  });
});

document.querySelector('.key.equals').addEventListener('click', () => {
  if (!op || !prev) return;
  const p = parseFloat(prev);
  const c = parseFloat(curr);
  let res = 0;
  if (op === '+') res = p + c;
  if (op === '−') res = p - c;
  if (op === '×') res = p * c;
  if (op === '÷') res = c !== 0 ? p / c : 'Error';
  console.log(\`Calculation: \${p} \${op} \${c} = \${res}\`);
  curr = String(res);
  prev = '';
  op = null;
  updateDisplay();
});
console.log("Interactive calculator ready.");`,
  },
];

// Single Script Benchmark Presets
const BENCHMARK_TEMPLATES = [
  {
    name: "Fibonacci Memoized Benchmark",
    snippet: `// BroAI WebGPU / JS Benchmark
function benchmarkFibonacci(n) {
  const start = performance.now();
  function fib(num, memo = {}) {
    if (num in memo) return memo[num];
    if (num <= 1) return num;
    memo[num] = fib(num - 1, memo) + fib(num - 2, memo);
    return memo[num];
  }
  const result = fib(n);
  const durationMs = (performance.now() - start).toFixed(3);
  return { n, result, durationMs };
}

console.log("--- Starting Local Execution ---");
for (let i = 10; i <= 50; i += 10) {
  const stat = benchmarkFibonacci(i);
  console.log(\`Fibonacci(\${stat.n}) = \${stat.result} (computed in \${stat.durationMs}ms)\`);
}
console.log("--- Benchmark Completed Successfully ---");`,
  },
  {
    name: "Matrix Multiplication (GPU Simulation)",
    snippet: `// Matrix multiplication algorithm
function multiplyMatrices(a, b) {
  const rowsA = a.length, colsA = a[0].length, colsB = b[0].length;
  const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

const matA = [[1, 2], [3, 4]];
const matB = [[5, 6], [7, 8]];
console.log("Matrix A:", matA);
console.log("Matrix B:", matB);
console.log("Result A x B:", multiplyMatrices(matA, matB));`,
  },
  {
    name: "Cosine Similarity (Vector Math)",
    snippet: `// Cosine similarity for high-dimensional vectors
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecA[i] ** 2;
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

const query = [0.15, 0.82, -0.34, 0.44];
const doc1 = [0.18, 0.79, -0.30, 0.41];
const doc2 = [-0.60, 0.12, 0.88, -0.22];

console.log("Doc1 Similarity:", cosineSimilarity(query, doc1).toFixed(4));
console.log("Doc2 Similarity:", cosineSimilarity(query, doc2).toFixed(4));`,
  },
];

export const CodeSandboxView: React.FC<CodeSandboxViewProps> = ({ initialCode }) => {
  // Mode: Frontend (HTML/CSS/JS with Live IFrame) vs Benchmark (Single script)
  const [sandboxMode, setSandboxMode] = useState<SandboxMode>("frontend");

  // Active Code States
  const [activeTab, setActiveTab] = useState<EditorTab>("html");
  const [htmlCode, setHtmlCode] = useState(FRONTEND_TEMPLATES[0]!.html);
  const [cssCode, setCssCode] = useState(FRONTEND_TEMPLATES[0]!.css);
  const [jsCode, setJsCode] = useState(FRONTEND_TEMPLATES[0]!.js);
  const [benchmarkCode, setBenchmarkCode] = useState(
    initialCode || BENCHMARK_TEMPLATES[0]!.snippet,
  );

  // Settings
  const [autoRun, setAutoRun] = useState(true);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("split-horizontal");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [includeTailwind, setIncludeTailwind] = useState(false);
  const [copied, setCopied] = useState(false);
  const [executionTime, setExecutionTime] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Dev Console Logs
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([
    {
      id: "init",
      level: "log",
      message: "BroAI Code Sandbox active. Ready for live execution.",
      time: new Date().toLocaleTimeString(),
    },
  ]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen to postMessage from the iframe sandbox
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SANDBOX_CONSOLE") {
        const { level, message, time } = event.data;
        setConsoleLogs((prev) => [
          ...prev.slice(-49), // Keep last 50 logs
          {
            id: `log-${Date.now()}-${Math.random()}`,
            level: level || "log",
            message: message || "",
            time: time || new Date().toLocaleTimeString(),
          },
        ]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Update script if initialCode passed from parent
  useEffect(() => {
    if (initialCode) {
      if (
        initialCode.includes("<html") ||
        initialCode.includes("<div") ||
        initialCode.includes("<!DOCTYPE")
      ) {
        setHtmlCode(initialCode);
        setSandboxMode("frontend");
      } else {
        setBenchmarkCode(initialCode);
        setSandboxMode("benchmark");
      }
    }
  }, [initialCode]);

  // Generate HTML bundle for iframe
  const bundledHtmlDoc = useMemo(() => {
    const tailwindScript = includeTailwind
      ? `<script src="https://cdn.tailwindcss.com"></script>`
      : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${tailwindScript}
  <style>
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    (function() {
      const _log = console.log;
      const _warn = console.warn;
      const _error = console.error;
      function send(type, args) {
        try {
          const str = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
          window.parent.postMessage({ type: 'SANDBOX_CONSOLE', level: type, message: str, time: new Date().toLocaleTimeString() }, '*');
        } catch(e) {}
      }
      console.log = function(...args) { send('log', args); _log.apply(console, args); };
      console.warn = function(...args) { send('warn', args); _warn.apply(console, args); };
      console.error = function(...args) { send('error', args); _error.apply(console, args); };
      window.onerror = function(msg, url, line) { send('error', [\`\${msg} (Line \${line})\`]); };
    })();
  </script>
  <script>
    try {
      ${jsCode}
    } catch(err) {
      console.error("Runtime Exception: " + err.message);
    }
  </script>
</body>
</html>`;
  }, [htmlCode, cssCode, jsCode, includeTailwind]);

  // Debounced auto-run for Frontend Studio
  useEffect(() => {
    if (!autoRun || sandboxMode !== "frontend") return;
    const timer = setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.srcdoc = bundledHtmlDoc;
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [bundledHtmlDoc, autoRun, sandboxMode]);

  const handleManualRunFrontend = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = bundledHtmlDoc;
    }
    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `run-${Date.now()}`,
        level: "log",
        message: "Manually reloaded preview frame.",
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Run Benchmark JS in pure browser runtime
  const handleRunBenchmark = () => {
    setIsRunning(true);
    const logs: ConsoleLog[] = [];
    const startTime = performance.now();

    const customConsole = {
      log: (...args: unknown[]) => {
        const text = args
          .map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)))
          .join(" ");
        logs.push({
          id: `log-${Date.now()}-${Math.random()}`,
          level: "log",
          message: text,
          time: new Date().toLocaleTimeString(),
        });
      },
      error: (...args: unknown[]) => {
        logs.push({
          id: `err-${Date.now()}-${Math.random()}`,
          level: "error",
          message: args.map(String).join(" "),
          time: new Date().toLocaleTimeString(),
        });
      },
      warn: (...args: unknown[]) => {
        logs.push({
          id: `warn-${Date.now()}-${Math.random()}`,
          level: "warn",
          message: args.map(String).join(" "),
          time: new Date().toLocaleTimeString(),
        });
      },
    };

    try {
      const runFn = new Function("console", "performance", "setTimeout", benchmarkCode);
      runFn(customConsole, performance, setTimeout);
      const duration = (performance.now() - startTime).toFixed(2);
      setExecutionTime(`${duration} ms`);
      setConsoleLogs((prev) => [
        ...prev,
        ...logs,
        {
          id: `end-${Date.now()}`,
          level: "log",
          message: `Execution completed in ${duration} ms`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err: unknown) {
      setConsoleLogs((prev) => [
        ...prev,
        ...logs,
        {
          id: `err-${Date.now()}`,
          level: "error",
          message: `Runtime Error: ${(err as Error)?.message || String(err)}`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
      setExecutionTime(null);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    let contentToCopy = "";
    if (sandboxMode === "frontend") {
      if (activeTab === "html") contentToCopy = htmlCode;
      else if (activeTab === "css") contentToCopy = cssCode;
      else if (activeTab === "js") contentToCopy = jsCode;
      else contentToCopy = bundledHtmlDoc;
    } else {
      contentToCopy = benchmarkCode;
    }
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadProject = () => {
    const blob = new Blob([bundledHtmlDoc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "broai-sandbox-project.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadFrontendTemplate = (tpl: (typeof FRONTEND_TEMPLATES)[number]) => {
    setHtmlCode(tpl.html);
    setCssCode(tpl.css);
    setJsCode(tpl.js);
    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `tpl-${Date.now()}`,
        level: "log",
        message: `Loaded template: ${tpl.name}`,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Snippet inserters
  const insertSnippet = (snippet: string) => {
    if (activeTab === "html") setHtmlCode((prev) => prev + "\n" + snippet);
    else if (activeTab === "css") setCssCode((prev) => prev + "\n" + snippet);
    else if (activeTab === "js") setJsCode((prev) => prev + "\n" + snippet);
  };

  return (
    <div
      id="code-sandbox-view"
      className="flex-1 flex flex-col h-screen bg-[#070b14] text-slate-100 overflow-hidden font-sans select-none"
    >
      {/* Top Studio Header matching CodeEditor / BroAI style */}
      <header className="h-14 border-b border-[#142036] px-3 sm:px-6 flex items-center justify-between bg-[#080d18] z-20 flex-shrink-0">
        {/* Left: Branding & Mode Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] text-slate-950">
              <CodeXml className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Code <span className="text-[#38bdf8]">Studio</span>
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#0e1728] border border-[#1b2b46]">
            <button
              onClick={() => setSandboxMode("frontend")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                sandboxMode === "frontend"
                  ? "bg-[#0284c7] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Web Studio (HTML/CSS/JS)</span>
            </button>
            <button
              onClick={() => setSandboxMode("benchmark")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                sandboxMode === "benchmark"
                  ? "bg-[#0284c7] text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>JS / WebGPU Runner</span>
            </button>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {sandboxMode === "frontend" && (
            <>
              {/* Auto-run Toggle */}
              <button
                onClick={() => setAutoRun(!autoRun)}
                title={autoRun ? "Auto-run is ON (Live updates)" : "Auto-run is OFF"}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition cursor-pointer ${
                  autoRun
                    ? "bg-emerald-950/60 border-emerald-700/50 text-emerald-400"
                    : "bg-[#0f192b] border-[#1e2f4c] text-slate-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${autoRun ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`}
                ></span>
                <span>Auto-Run</span>
              </button>

              {/* Tailwind CDN Toggle */}
              <button
                onClick={() => setIncludeTailwind(!includeTailwind)}
                title="Include Tailwind CSS CDN"
                className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border transition cursor-pointer ${
                  includeTailwind
                    ? "bg-sky-950/60 border-sky-600/50 text-[#38bdf8]"
                    : "bg-[#0f192b] border-[#1e2f4c] text-slate-400"
                }`}
              >
                <span>Tailwind CDN</span>
              </button>

              {/* Download Bundle */}
              <button
                onClick={handleDownloadProject}
                title="Download index.html project"
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-[#0f192b] hover:bg-[#182844] text-slate-300 hover:text-white border border-[#1b2b46] transition text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#38bdf8]" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </>
          )}

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-[#0f192b] hover:bg-[#182844] text-slate-300 hover:text-white border border-[#1b2b46] transition text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            title="Copy current code"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </button>

          {/* Primary Action Button */}
          {sandboxMode === "frontend" ? (
            <button
              onClick={handleManualRunFrontend}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:opacity-95 text-slate-950 font-bold text-xs shadow-[0_0_12px_rgba(56,189,248,0.35)] transition cursor-pointer active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current stroke-none" />
              <span>Run / Refresh</span>
            </button>
          ) : (
            <button
              onClick={handleRunBenchmark}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:opacity-95 text-slate-950 font-bold text-xs shadow-[0_0_12px_rgba(56,189,248,0.35)] transition cursor-pointer active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current stroke-none" />
              <span>{isRunning ? "Running..." : "Run Script"}</span>
            </button>
          )}
        </div>
      </header>

      {/* Preset Showcase Ribbon (Frontend Mode) */}
      {sandboxMode === "frontend" ? (
        <div className="bg-[#0a1120] border-b border-[#142036] px-3 sm:px-6 py-2 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Templates:
            </span>
            <div className="flex items-center gap-1.5">
              {FRONTEND_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleLoadFrontendTemplate(tpl)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#0e182a] hover:bg-[#16253e] text-slate-300 hover:text-white border border-[#1b2b46] text-xs transition cursor-pointer"
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Snippet Inserters */}
          <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[11px] text-slate-400 font-mono">Insert:</span>
            <button
              onClick={() =>
                insertSnippet(
                  activeTab === "html"
                    ? '<canvas id="myCanvas" width="400" height="300"></canvas>'
                    : activeTab === "css"
                      ? "display: flex;\njustify-content: center;\nalign-items: center;"
                      : 'const canvas = document.getElementById("myCanvas");\nconst ctx = canvas.getContext("2d");',
                )
              }
              className="px-2 py-0.5 rounded bg-[#101b30] hover:bg-[#192b4a] text-slate-300 text-[11px] border border-[#1b2d4b] transition cursor-pointer"
            >
              + {activeTab.toUpperCase()} Snippet
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#0a1120] border-b border-[#142036] px-3 sm:px-6 py-2 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Benchmark Presets:
            </span>
            <div className="flex items-center gap-1.5">
              {BENCHMARK_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => setBenchmarkCode(tpl.snippet)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#0e182a] hover:bg-[#16253e] text-slate-300 hover:text-white border border-[#1b2b46] text-xs transition cursor-pointer"
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>
          {executionTime && (
            <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 flex-shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Execution: {executionTime}
            </div>
          )}
        </div>
      )}

      {/* Main Studio Workspace */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {sandboxMode === "frontend" ? (
          /* FRONTEND STUDIO WITH LIVE PREVIEW */
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
            {/* Left Panel: Triple Tabs Editor (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col border-r border-[#142036] bg-[#070c17] min-h-0 overflow-hidden">
              {/* Language Navigation Bar */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#09101e] border-b border-[#142036] flex-shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab("html")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeTab === "html"
                        ? "bg-[#0284c7] text-white shadow-sm font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#101c33]"
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5 text-orange-400" />
                    <span>HTML</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("css")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeTab === "css"
                        ? "bg-[#0284c7] text-white shadow-sm font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#101c33]"
                    }`}
                  >
                    <Paintbrush className="h-3.5 w-3.5 text-sky-400" />
                    <span>CSS</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("js")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeTab === "js"
                        ? "bg-[#0284c7] text-white shadow-sm font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#101c33]"
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5 text-yellow-400" />
                    <span>JS</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("console")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeTab === "console"
                        ? "bg-[#0284c7] text-white shadow-sm font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#101c33]"
                    }`}
                  >
                    <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Console</span>
                    {consoleLogs.length > 0 && (
                      <span className="px-1.5 py-0.2 bg-[#12223d] rounded text-[10px] font-mono text-[#38bdf8]">
                        {consoleLogs.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-500">
                  {activeTab === "html" && "index.html"}
                  {activeTab === "css" && "styles.css"}
                  {activeTab === "js" && "app.js"}
                  {activeTab === "console" && "dev-console.log"}
                </div>
              </div>

              {/* Editor Workspace Content */}
              <div className="flex-1 min-h-0 relative flex flex-col">
                {activeTab === "html" && (
                  <textarea
                    id="html-editor-textarea"
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    spellCheck={false}
                    className="flex-1 w-full bg-[#070c17] p-4 text-xs font-mono text-slate-200 outline-none resize-none leading-relaxed overflow-auto scrollbar-thin"
                    placeholder="<!-- Write your HTML structure here -->"
                  />
                )}

                {activeTab === "css" && (
                  <textarea
                    id="css-editor-textarea"
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    spellCheck={false}
                    className="flex-1 w-full bg-[#070c17] p-4 text-xs font-mono text-sky-200 outline-none resize-none leading-relaxed overflow-auto scrollbar-thin"
                    placeholder="/* Write your CSS rules & animations here */"
                  />
                )}

                {activeTab === "js" && (
                  <textarea
                    id="js-editor-textarea"
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    spellCheck={false}
                    className="flex-1 w-full bg-[#070c17] p-4 text-xs font-mono text-amber-200 outline-none resize-none leading-relaxed overflow-auto scrollbar-thin"
                    placeholder="// Write your JavaScript logic here"
                  />
                )}

                {activeTab === "console" && (
                  <div className="flex-1 flex flex-col bg-[#050912] overflow-hidden">
                    <div className="px-3 py-1.5 bg-[#0a1120] border-b border-[#142036] flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">
                        Logs captured from sandbox iframe:
                      </span>
                      <button
                        onClick={() => setConsoleLogs([])}
                        className="text-[11px] text-slate-400 hover:text-red-400 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" /> Clear Logs
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs text-slate-300">
                      {consoleLogs.length === 0 ? (
                        <div className="text-slate-500 italic text-center py-12">
                          Console log buffer is clear.
                        </div>
                      ) : (
                        consoleLogs.map((log) => (
                          <div
                            key={log.id}
                            className={`flex items-start gap-2 leading-relaxed py-0.5 border-b border-[#0f1a2e] ${
                              log.level === "error"
                                ? "text-red-400 bg-red-950/20"
                                : log.level === "warn"
                                  ? "text-amber-300 bg-amber-950/20"
                                  : "text-slate-200"
                            }`}
                          >
                            <span className="text-slate-600 text-[10px] select-none">
                              [{log.time}]
                            </span>
                            <span className="text-[#38bdf8] select-none">&gt;</span>
                            <span className="whitespace-pre-wrap break-all">{log.message}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Live Output Preview (6 Cols) */}
            <div className="lg:col-span-6 flex flex-col bg-[#050811] min-h-0 overflow-hidden">
              {/* Preview Bar with Device Switcher */}
              <div className="h-10 px-3 bg-[#09101e] border-b border-[#142036] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span className="text-xs font-semibold text-white">Interactive Preview</span>
                  </div>
                </div>

                {/* Device Frame Switcher */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0e1728] border border-[#1b2b46]">
                  <button
                    onClick={() => setDeviceMode("desktop")}
                    title="Desktop 100%"
                    className={`p-1 rounded text-slate-400 hover:text-white transition cursor-pointer ${
                      deviceMode === "desktop" ? "bg-[#0284c7] text-white" : ""
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeviceMode("tablet")}
                    title="Tablet View (768px)"
                    className={`p-1 rounded text-slate-400 hover:text-white transition cursor-pointer ${
                      deviceMode === "tablet" ? "bg-[#0284c7] text-white" : ""
                    }`}
                  >
                    <Tablet className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeviceMode("mobile")}
                    title="Mobile View (375px)"
                    className={`p-1 rounded text-slate-400 hover:text-white transition cursor-pointer ${
                      deviceMode === "mobile" ? "bg-[#0284c7] text-white" : ""
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* IFrame Container with Device Bezel */}
              <div className="flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 bg-[#050811] overflow-auto">
                <div
                  className={`h-full transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-[#17253d] bg-black ${
                    deviceMode === "desktop"
                      ? "w-full"
                      : deviceMode === "tablet"
                        ? "w-[768px] max-w-full"
                        : "w-[375px] max-w-full"
                  }`}
                >
                  <iframe
                    ref={iframeRef}
                    title="BroAI Sandbox Preview"
                    sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
                    className="w-full h-full border-none bg-black"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* BENCHMARK / SINGLE SCRIPT WORKSPACE */
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
            {/* Editor (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col border-r border-[#142036] bg-[#070c17] min-h-0">
              <div className="flex items-center justify-between px-4 py-2 bg-[#09101e] border-b border-[#142036]">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80"></span>
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/80"></span>
                  <span className="font-mono text-slate-300 ml-2 text-xs font-semibold">
                    benchmark.js
                  </span>
                </div>
                <button
                  onClick={() => setBenchmarkCode(BENCHMARK_TEMPLATES[0]!.snippet)}
                  className="px-2 py-1 rounded bg-[#101b30] hover:bg-[#182a4a] text-slate-400 hover:text-white text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              </div>
              <textarea
                value={benchmarkCode}
                onChange={(e) => setBenchmarkCode(e.target.value)}
                spellCheck={false}
                className="flex-1 w-full bg-[#070c17] p-4 text-xs font-mono text-slate-200 outline-none resize-none leading-relaxed overflow-auto scrollbar-thin"
              />
            </div>

            {/* Terminal Logs (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col bg-[#050912] min-h-0">
              <div className="flex items-center justify-between px-4 py-2 bg-[#09101e] border-b border-[#142036]">
                <div className="flex items-center gap-2 text-slate-300 font-mono text-xs font-semibold">
                  <Terminal className="h-3.5 w-3.5 text-[#38bdf8]" />
                  Execution Terminal
                </div>
                <button
                  onClick={() => setConsoleLogs([])}
                  className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Clear Terminal
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-xs text-slate-300">
                {consoleLogs.length === 0 ? (
                  <div className="text-slate-500 italic text-center py-16">
                    Click "Run Script" to benchmark execution locally.
                  </div>
                ) : (
                  consoleLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`leading-relaxed whitespace-pre-wrap ${
                        log.level === "error"
                          ? "text-red-400"
                          : log.level === "warn"
                            ? "text-amber-300"
                            : "text-slate-200"
                      }`}
                    >
                      <span className="text-slate-600 select-none mr-2">&gt;</span>
                      {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
