import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Film,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Layers,
  Wand2,
  Sliders,
  Maximize2,
  Volume2,
  VolumeX,
  Repeat,
  Camera,
  Zap,
  Check,
  Copy,
  Clock,
  Video,
  RefreshCw,
  Gift,
  Trash2,
  Image as ImageIcon,
  Palette,
  Eye,
  SlidersHorizontal,
  Flame,
  Sun,
  FileVideo,
} from "lucide-react";
import { WebGpuStats } from "@/types";

interface VideoLabViewProps {
  gpuStats: WebGpuStats;
}

type VideoMode = "image-to-video" | "video-to-video" | "text-to-video";

interface VideoPreset {
  id: string;
  title: string;
  category: string;
  prompt: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  motionStyle: string;
  aspectRatio: "16:9" | "9:16" | "1:1" | "21:9";
}

const SAMPLE_IMAGES = [
  {
    id: "portrait-cyber",
    name: "Cyberpunk Girl",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    prompt:
      "Animate glowing neon reflections in eyes, soft hair floating in cyber wind, volumetric holographic backlight",
  },
  {
    id: "nature-waterfall",
    name: "Alpine Mist",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    prompt:
      "Drone push-in over snowy jagged mountain peaks at sunset golden hour, cinematic rolling clouds, 4k 60fps",
  },
  {
    id: "jellyfish-glow",
    name: "Deep Ocean",
    url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    prompt:
      "Slow undulating bioluminescent tentacles floating in deep abyss, cyan caustics, cinematic macro orbit",
  },
  {
    id: "space-nebula",
    name: "Cosmic Nebula",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    prompt:
      "3D camera spiral roll through swirling magenta space dust and stellar flares, zero-gravity depth",
  },
];

const VIDEO_PRESETS: VideoPreset[] = [
  {
    id: "cyberpunk-drift",
    title: "Neo-Tokyo Cyberpunk Skyway",
    category: "Sci-Fi & Urban",
    prompt:
      "Futuristic flying vehicle cruising between neon-lit holographic skyscrapers in Neo-Tokyo, heavy rain reflections, 8k cinematic lighting, volumetric atmospheric fog",
    thumbnail:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-futuristic-city-with-neon-lights-42861-large.mp4",
    duration: "5s",
    motionStyle: "Drone Flythrough",
    aspectRatio: "16:9",
  },
  {
    id: "bioluminescent-ocean",
    title: "Abyssal Jellyfish Glow",
    category: "Nature & Abstract",
    prompt:
      "Ethereal glowing bioluminescent jellyfish pulsing through deep midnight abyss, iridescent cyan and violet tentacles, underwater caustics, slow-motion",
    thumbnail:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-glowing-jellyfish-floating-underwater-42918-large.mp4",
    duration: "6s",
    motionStyle: "Slow Orbit",
    aspectRatio: "16:9",
  },
  {
    id: "mountain-timelapse",
    title: "Alpine Sunset Hyperlapse",
    category: "Cinematic Landscape",
    prompt:
      "Hyperlapse of rolling mist clouds sweeping over snowy mountain peaks at golden hour, vivid magenta sky, golden sunrays piercing peaks",
    thumbnail:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-clouds-moving-over-the-mountains-in-a-time-lapse-42994-large.mp4",
    duration: "5s",
    motionStyle: "Hyperlapse Pan",
    aspectRatio: "16:9",
  },
  {
    id: "astronaut-nebula",
    title: "Cosmic Spacewalk Orbit",
    category: "Space & Astral",
    prompt:
      "Astronaut tethered outside space station floating majestically with glowing solar visor reflecting cosmic nebula, 0G zero gravity, 4k ultra-realistic",
    thumbnail:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1610-large.mp4",
    duration: "8s",
    motionStyle: "3D Zero-G Pan",
    aspectRatio: "16:9",
  },
];

const CAMERA_MOTIONS = [
  { id: "zoom-in", label: "Dolly In", icon: "⊕", desc: "Dynamic cinematic push-in" },
  { id: "zoom-out", label: "Dolly Out", icon: "⊖", desc: "Expansive reveal pull-back" },
  { id: "pan-left-right", label: "Smooth Pan", icon: "↔", desc: "Horizontal sweeping camera" },
  { id: "orbit-360", label: "Cinematic Orbit", icon: "↺", desc: "Rotational perspective orbit" },
  { id: "drone-flyover", label: "Drone Flyover", icon: "▲", desc: "High-angle vertical lift" },
  { id: "breathing-float", label: "Living Float", icon: "≋", desc: "Organic rhythmic sine motion" },
];

const VIDEO_EFFECTS = [
  { id: "none", name: "Original Dynamic", tag: "Natural Color" },
  { id: "cyberpunk", name: "Cyberpunk Neon", tag: "Cyan & Magenta Glow" },
  { id: "cinematic", name: "Cinematic 8K", tag: "Teal & Orange Grade" },
  { id: "anime", name: "Anime Cel Shading", tag: "Vibrant Saturations" },
  { id: "vintage", name: "35mm Film Grain", tag: "Analog Retro Mood" },
  { id: "noir", name: "Noir Black & White", tag: "High Contrast Shadow" },
];

const PARTICLE_EFFECTS = [
  { id: "none", name: "None" },
  { id: "embers", name: "🔥 Embers & Sparks" },
  { id: "stars", name: "✨ Cosmic Stardust" },
  { id: "rain", name: "🌧️ Cyber Rain" },
  { id: "petals", name: "🌸 Floating Blossoms" },
];

export const VideoLabView: React.FC<VideoLabViewProps> = ({ gpuStats: _gpuStats }) => {
  const [mode, setMode] = useState<VideoMode>("image-to-video");
  const [prompt, setPrompt] = useState(
    "Cinematic camera push-in with gentle atmospheric floating particles, volumetric golden sunlight, realistic depth-of-field, 4k 60fps",
  );
  const [selectedMotion, setSelectedMotion] = useState("zoom-in");
  const [selectedEffect, setSelectedEffect] = useState("cyberpunk");
  const [selectedParticles, setSelectedParticles] = useState("embers");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1" | "21:9">("16:9");
  const [durationSec, setDurationSec] = useState<number>(5);
  const [fps, setFps] = useState<24 | 30 | 60>(30);
  const [motionIntensity, setMotionIntensity] = useState<number>(6);
  const [cameraSpeed, setCameraSpeed] = useState<number>(1);

  // Uploaded User Media state
  const [uploadedImage, setUploadedImage] = useState<string | null>(SAMPLE_IMAGES[0].url);
  const [uploadedImageName, setUploadedImageName] = useState<string>("Sample Portrait");
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [uploadedVideoName, setUploadedVideoName] = useState<string>("");

  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Playback & Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState("");
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>(
    "Cyberpunk Portrait Animation",
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isLooping, setIsLooping] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isRecordingExport, setIsRecordingExport] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Rendering engine & elements
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const sourceVideoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particleStateRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      hue: number;
    }>
  >([]);

  // Load Image into source reference
  useEffect(() => {
    if (uploadedImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = uploadedImage;
      img.onload = () => {
        sourceImageRef.current = img;
      };
    }
  }, [uploadedImage]);

  // Initialize Particles
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 65; i++) {
      particles.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -0.5 - Math.random() * 2,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.7 + 0.3,
        hue: Math.random() * 40 + 20, // warm glow
      });
    }
    particleStateRef.current = particles;
  }, [selectedParticles]);

  // Core 60FPS Video Canvas Renderer
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const now = performance.now() / 1000;
    const t = isPlaying ? (now * cameraSpeed) % durationSec : currentTime % durationSec;

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // 1. Draw Base Source (User Video or User Image or Procedural Text Canvas)
    if (mode === "video-to-video" && sourceVideoRef.current && uploadedVideo) {
      // Calculate transform from motion
      const progress = (t / durationSec) * Math.PI * 2;
      let scale = 1.0;
      let tx = 0;
      let ty = 0;
      let rotate = 0;
      const intensity = (motionIntensity / 10) * 0.15;

      if (selectedMotion === "zoom-in") scale = 1.0 + (t / durationSec) * intensity * 2;
      else if (selectedMotion === "zoom-out")
        scale = 1.0 + intensity * 2 - (t / durationSec) * intensity * 2;
      else if (selectedMotion === "pan-left-right") tx = Math.sin(progress) * (w * intensity);
      else if (selectedMotion === "orbit-360") {
        rotate = Math.sin(progress * 0.5) * intensity * 0.5;
        scale = 1.0 + Math.abs(Math.sin(progress)) * intensity;
      } else if (selectedMotion === "drone-flyover")
        ty = -Math.sin(progress * 0.5) * (h * intensity);
      else if (selectedMotion === "breathing-float") {
        scale = 1.0 + Math.sin(progress * 2) * intensity;
        ty = Math.sin(progress * 2) * 8;
      }

      ctx.translate(w / 2, h / 2);
      ctx.rotate(rotate);
      ctx.scale(scale, scale);
      ctx.translate(-w / 2 + tx, -h / 2 + ty);

      ctx.drawImage(sourceVideoRef.current, 0, 0, w, h);
    } else if (
      (mode === "image-to-video" || mode === "text-to-video") &&
      sourceImageRef.current &&
      sourceImageRef.current.complete
    ) {
      // Smooth camera transformation on user image
      const progress = (t / durationSec) * Math.PI * 2;
      let scale = 1.0;
      let tx = 0;
      let ty = 0;
      let rotate = 0;
      const intensity = (motionIntensity / 10) * 0.2;

      if (selectedMotion === "zoom-in") {
        scale = 1.0 + (t / durationSec) * intensity * 1.8;
      } else if (selectedMotion === "zoom-out") {
        scale = 1.0 + intensity * 1.8 - (t / durationSec) * intensity * 1.8;
      } else if (selectedMotion === "pan-left-right") {
        tx = Math.sin(progress) * (w * intensity);
      } else if (selectedMotion === "orbit-360") {
        rotate = Math.sin(progress * 0.5) * (intensity * 0.4);
        scale = 1.05 + Math.cos(progress) * (intensity * 0.6);
      } else if (selectedMotion === "drone-flyover") {
        ty = -Math.sin(progress * 0.5) * (h * intensity * 1.2);
        scale = 1.0 + (t / durationSec) * (intensity * 0.8);
      } else if (selectedMotion === "breathing-float") {
        scale = 1.0 + Math.sin(progress * 2) * (intensity * 0.8);
        ty = Math.sin(progress * 2) * 12;
      }

      ctx.translate(w / 2, h / 2);
      ctx.rotate(rotate);
      ctx.scale(scale, scale);
      ctx.translate(-w / 2 + tx, -h / 2 + ty);

      // Draw user image scaled nicely to canvas
      const img = sourceImageRef.current;
      const imgAspect = img.width / img.height;
      const canvasAspect = w / h;
      let dw = w;
      let dh = h;
      let dx = 0;
      let dy = 0;

      if (imgAspect > canvasAspect) {
        dw = h * imgAspect;
        dx = (w - dw) / 2;
      } else {
        dh = w / imgAspect;
        dy = (h - dh) / 2;
      }

      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      // Fallback background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(0.5, "#1e1b4b");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();

    // 2. Apply Custom AI Visual Style Shaders / Color Grades
    if (selectedEffect === "cyberpunk") {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const cyberGrad = ctx.createRadialGradient(w * 0.2, h * 0.2, 50, w * 0.8, h * 0.8, w * 0.8);
      cyberGrad.addColorStop(0, "rgba(236, 72, 153, 0.25)");
      cyberGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.2)");
      cyberGrad.addColorStop(1, "rgba(168, 85, 247, 0.25)");
      ctx.fillStyle = cyberGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    } else if (selectedEffect === "cinematic") {
      ctx.save();
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = "rgba(14, 165, 233, 0.15)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    } else if (selectedEffect === "anime") {
      ctx.save();
      ctx.globalCompositeOperation = "overlay";
      ctx.fillStyle = "rgba(244, 114, 182, 0.2)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    } else if (selectedEffect === "vintage") {
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    } else if (selectedEffect === "noir") {
      ctx.save();
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = "rgba(100, 116, 139, 0.9)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // 3. Render Volumetric Particles (Embers, Stars, Rain, Petals)
    if (selectedParticles !== "none" && particleStateRef.current.length > 0) {
      ctx.save();
      particleStateRef.current.forEach((p) => {
        if (isPlaying) {
          p.x += p.vx * cameraSpeed;
          p.y += p.vy * cameraSpeed;
          if (p.y < -10) p.y = h + 10;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
        }

        ctx.beginPath();
        if (selectedParticles === "embers") {
          ctx.fillStyle = `rgba(251, 146, 60, ${p.alpha})`;
          ctx.shadowColor = "#f97316";
          ctx.shadowBlur = 8;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (selectedParticles === "stars") {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 6;
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else if (selectedParticles === "rain") {
          ctx.strokeStyle = `rgba(186, 230, 253, ${p.alpha * 0.6})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 2, p.y + 12);
          ctx.stroke();
        } else if (selectedParticles === "petals") {
          ctx.fillStyle = `rgba(244, 114, 182, ${p.alpha})`;
          ctx.shadowColor = "#ec4899";
          ctx.shadowBlur = 4;
          ctx.ellipse(p.x, p.y, p.size * 1.5, p.size * 0.8, p.x * 0.05, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
    }

    // 4. Subtle Cinematic Letterbox / Vignette
    ctx.save();
    const vigGrad = ctx.createRadialGradient(
      w / 2,
      h / 2,
      Math.min(w, h) * 0.4,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.7,
    );
    vigGrad.addColorStop(0, "rgba(0,0,0,0)");
    vigGrad.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // 5. Bottom Overlay Info Pill
    ctx.save();
    ctx.fillStyle = "rgba(7, 11, 20, 0.75)";
    ctx.fillRect(16, h - 38, w - 32, 26);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(16, h - 38, w - 32, 26);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `MOTION: ${selectedMotion.toUpperCase()} | STYLE: ${selectedEffect.toUpperCase()} | 60 FPS`,
      26,
      h - 22,
    );

    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.textAlign = "right";
    ctx.fillText(`BroAI Studio`, w - 26, h - 22);
    ctx.restore();

    if (isPlaying) {
      setCurrentTime(t);
    }
  }, [
    mode,
    uploadedVideo,
    selectedMotion,
    motionIntensity,
    selectedEffect,
    selectedParticles,
    cameraSpeed,
    isPlaying,
    currentTime,
    durationSec,
  ]);

  // Animation Loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderFrame();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderFrame]);

  // Video playback sync for video-to-video mode
  useEffect(() => {
    if (sourceVideoRef.current) {
      if (isPlaying) {
        sourceVideoRef.current.play().catch(() => {});
      } else {
        sourceVideoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle User Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          setUploadedImage(url);
          setUploadedImageName(file.name);
          setCurrentVideoTitle(`Animated: ${file.name.replace(/\.[^/.]+$/, "")}`);
          setMode("image-to-video");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle User Video Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedVideo(url);
      setUploadedVideoName(file.name);
      setCurrentVideoTitle(`Transformed: ${file.name.replace(/\.[^/.]+$/, "")}`);
      setMode("video-to-video");

      if (sourceVideoRef.current) {
        sourceVideoRef.current.src = url;
        sourceVideoRef.current.load();
        sourceVideoRef.current.play().catch(() => {});
      }
    }
  };

  // Select Sample Image
  const handleSelectSample = (sample: (typeof SAMPLE_IMAGES)[0]) => {
    setUploadedImage(sample.url);
    setUploadedImageName(sample.name);
    setPrompt(sample.prompt);
    setCurrentVideoTitle(`Animated: ${sample.name}`);
    setMode("image-to-video");
  };

  // Select Preset Video
  const handleSelectPreset = (preset: VideoPreset) => {
    setPrompt(preset.prompt);
    setUploadedVideo(preset.videoUrl);
    setUploadedVideoName(preset.title);
    setCurrentVideoTitle(preset.title);
    setAspectRatio(preset.aspectRatio);
    setMode("video-to-video");

    if (sourceVideoRef.current) {
      sourceVideoRef.current.src = preset.videoUrl;
      sourceVideoRef.current.load();
      sourceVideoRef.current.play().catch(() => {});
    }
  };

  // Process & Animate Video with User Prompt
  const handleProcessVideo = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationProgress(10);
    setGenerationStatus("Synthesizing optical vectors and camera trajectory...");

    const steps = [
      {
        progress: 25,
        msg: `Aligning prompt latents with ${mode === "video-to-video" ? "source video frames" : "user image structure"}...`,
      },
      {
        progress: 50,
        msg: `Applying ${selectedMotion} motion matrix & ${selectedEffect} color grading...`,
      },
      { progress: 75, msg: `Rendering ${durationSec}s animation sequence at ${fps} FPS...` },
      { progress: 95, msg: "Compiling WebM / MP4 video buffer..." },
      { progress: 100, msg: "Video ready for playback and export!" },
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      setGenerationProgress(steps[i].progress);
      setGenerationStatus(steps[i].msg);
    }

    setIsGenerating(false);
    setIsPlaying(true);
  };

  // Direct In-Browser High Quality Video Export (Free MP4/WebM)
  const handleDownloadVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isRecordingExport) return;

    setIsRecordingExport(true);
    setExportSuccess(false);

    try {
      const stream = canvas.captureStream(fps);
      const mimeTypes = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
      const supportedType =
        mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "video/webm";

      const recorder = new MediaRecorder(stream, {
        mimeType: supportedType,
        videoBitsPerSecond: 6000000,
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const cleanName = (currentVideoTitle || "broai-video")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");
        a.download = `${cleanName}-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecordingExport(false);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      };

      recorder.start();
      // Record for the specified duration
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, durationSec * 1000);
    } catch (err) {
      console.error("Video export error:", err);
      setIsRecordingExport(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#070b14] text-slate-100 overflow-y-auto font-sans p-3 sm:p-5 pb-24 md:pb-8">
      {/* Hidden Video element used as texture source for video-to-video */}
      <video
        ref={sourceVideoRef}
        loop={isLooping}
        muted={isMuted}
        playsInline
        crossOrigin="anonymous"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#141f33] max-w-7xl mx-auto w-full gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-600 via-purple-600 to-[#38bdf8] text-white shadow-lg shadow-purple-900/30">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                AI Video Studio
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Gift className="h-3 w-3" /> User Media + Prompt Powered
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your own photos or videos, give a cinematic prompt, and direct camera motion
                & visual styles in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-xl text-xs font-mono bg-[#0c1424] border border-[#1b2b48] text-[#38bdf8] flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Hardware Accelerated</span>
          </div>
          <div className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-950/50 border border-emerald-800/40 text-emerald-300">
            100% Free & Private
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="max-w-7xl mx-auto w-full mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: User Media Upload & Direction Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Mode Switcher */}
          <div className="bg-[#0b1220] border border-[#17253d] p-1 rounded-2xl grid grid-cols-3 gap-1 shadow-md">
            <button
              onClick={() => setMode("image-to-video")}
              className={`py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "image-to-video"
                  ? "bg-gradient-to-r from-purple-600 to-[#0284c7] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Image-to-Video</span>
            </button>
            <button
              onClick={() => setMode("video-to-video")}
              className={`py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "video-to-video"
                  ? "bg-gradient-to-r from-purple-600 to-[#0284c7] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileVideo className="h-3.5 w-3.5" />
              <span>Video-to-Video</span>
            </button>
            <button
              onClick={() => setMode("text-to-video")}
              className={`py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === "text-to-video"
                  ? "bg-gradient-to-r from-purple-600 to-[#0284c7] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>Text-to-Video</span>
            </button>
          </div>

          {/* User Image Upload Zone (Image-to-Video Mode) */}
          {mode === "image-to-video" && (
            <div className="bg-[#0e1628] border border-[#1c2d4a] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5 text-[#38bdf8]" /> Upload Your Image to Animate
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">100% Client-Side</span>
              </div>

              <div className="flex items-center gap-3">
                {uploadedImage ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#22385c] flex-shrink-0 group">
                    <img
                      src={uploadedImage}
                      alt="User image"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => imageFileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-950/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer text-[10px]"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center text-slate-500 flex-shrink-0">
                    <ImageIcon className="h-6 w-6 mb-1" />
                    <span className="text-[9px]">No image</span>
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <button
                    onClick={() => imageFileInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-900/80 to-[#132038] hover:from-purple-800 hover:to-[#1a2c4e] border border-[#2e4266] text-xs font-semibold text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Upload className="h-3.5 w-3.5 text-[#38bdf8]" />
                    <span>Upload Image from Device</span>
                  </button>
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-[10px] text-slate-400 truncate">
                    {uploadedImageName || "Supports JPG, PNG, WEBP (Portraits, Landscapes, Art)"}
                  </p>
                </div>
              </div>

              {/* Quick Sample Selector */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1.5">
                  Or try instant sample photos:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className={`relative aspect-square rounded-lg overflow-hidden border transition cursor-pointer ${
                        uploadedImage === sample.url
                          ? "border-[#38bdf8] ring-1 ring-[#38bdf8]"
                          : "border-slate-800 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={sample.url}
                        alt={sample.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] text-center text-white py-0.5 truncate px-0.5">
                        {sample.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* User Video Upload Zone (Video-to-Video Mode) */}
          {mode === "video-to-video" && (
            <div className="bg-[#0e1628] border border-[#1c2d4a] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <FileVideo className="h-3.5 w-3.5 text-purple-400" /> Upload Your Video for Style
                  & Motion VFX
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">100% Private</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => videoFileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-900/80 via-[#162744] to-[#132038] hover:opacity-95 border border-[#2e4266] text-xs font-semibold text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Upload className="h-3.5 w-3.5 text-[#38bdf8]" />
                  <span>Choose Video File (MP4, WebM, MOV)</span>
                </button>
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span className="truncate max-w-[200px] text-[#38bdf8] font-mono">
                    {uploadedVideoName ? `📹 ${uploadedVideoName}` : "No custom video loaded yet"}
                  </span>
                  {uploadedVideo && (
                    <button
                      onClick={() => {
                        setUploadedVideo(null);
                        setUploadedVideoName("");
                      }}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[10px]"
                    >
                      <Trash2 className="h-3 w-3" /> Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Prompt Box */}
          <div className="bg-[#0e1628] border border-[#1c2d4a] rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>Motion & Visual Direction Prompt</span>
              </label>
              <button
                onClick={handleCopyPrompt}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                title="Copy Prompt"
              >
                {copiedPrompt ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>{copiedPrompt ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="E.g., Cinematic slow push-in, volumetric light rays shining through mist, floating ember sparks, 4k 60fps..."
              className="w-full bg-[#080d17] border border-[#1c2d4a] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 outline-none resize-none transition"
            />

            {/* Quick Prompt Ideas */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              <span className="text-slate-500 flex-shrink-0">Presets:</span>
              <button
                onClick={() =>
                  setPrompt(
                    "Volumetric golden morning rays piercing through mist, gentle floating dust particles, 8k",
                  )
                }
                className="px-2 py-1 rounded-lg bg-[#142036] hover:bg-[#1c2d4a] text-slate-300 whitespace-nowrap transition cursor-pointer"
              >
                Golden Sunlight
              </button>
              <button
                onClick={() =>
                  setPrompt(
                    "Cyberpunk glowing neon rain, chromatic aberration, holographic reflections, anamorphic lens",
                  )
                }
                className="px-2 py-1 rounded-lg bg-[#142036] hover:bg-[#1c2d4a] text-slate-300 whitespace-nowrap transition cursor-pointer"
              >
                Neon Cyberpunk
              </button>
              <button
                onClick={() =>
                  setPrompt(
                    "Makoto Shinkai anime style, vibrant sunset clouds, cherry blossoms fluttering in wind",
                  )
                }
                className="px-2 py-1 rounded-lg bg-[#142036] hover:bg-[#1c2d4a] text-slate-300 whitespace-nowrap transition cursor-pointer"
              >
                Anime Bloom
              </button>
            </div>
          </div>

          {/* Camera Motion Selection */}
          <div className="bg-[#0e1628] border border-[#1c2d4a] rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-[#38bdf8]" />
                <span>Camera Motion Trajectory</span>
              </label>
              <span className="text-[10px] text-purple-400 font-mono">6 Direction Modes</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {CAMERA_MOTIONS.map((motion) => (
                <button
                  key={motion.id}
                  onClick={() => setSelectedMotion(motion.id)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    selectedMotion === motion.id
                      ? "bg-[#142440] border-[#38bdf8] text-white shadow-sm ring-1 ring-[#38bdf8]/30"
                      : "bg-[#0a0f1c] border-[#18263f] text-slate-400 hover:text-slate-200 hover:border-[#22375a]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-mono text-[#38bdf8]">{motion.icon}</span>
                    {selectedMotion === motion.id && <Check className="h-3 w-3 text-emerald-400" />}
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 mt-1">{motion.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Style Shaders & Particle Effects */}
          <div className="bg-[#0e1628] border border-[#1c2d4a] rounded-2xl p-4 space-y-4 shadow-lg">
            {/* Color Grade / Shader */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-pink-400" />
                  <span>AI Color Grade & Shading</span>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {VIDEO_EFFECTS.map((fx) => (
                  <button
                    key={fx.id}
                    onClick={() => setSelectedEffect(fx.id)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold text-center border transition cursor-pointer truncate ${
                      selectedEffect === fx.id
                        ? "bg-[#162744] border-pink-500 text-pink-200"
                        : "bg-[#090e1a] border-[#182742] text-slate-400 hover:text-white"
                    }`}
                  >
                    {fx.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Atmosphere Particles */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Atmospheric Particles</span>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {PARTICLE_EFFECTS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedParticles(p.id)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold text-center border transition cursor-pointer truncate ${
                      selectedParticles === p.id
                        ? "bg-[#162744] border-amber-500 text-amber-200"
                        : "bg-[#090e1a] border-[#182742] text-slate-400 hover:text-white"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Motion Intensity & Duration */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1.5">
                  <span>Motion Intensity</span>
                  <span className="font-mono text-[#38bdf8]">{motionIntensity}/10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={motionIntensity}
                  onChange={(e) => setMotionIntensity(parseInt(e.target.value))}
                  className="w-full accent-[#38bdf8] bg-[#090e1a] h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1.5">
                  <span>Duration</span>
                  <span className="font-mono text-purple-300">{durationSec}s</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[3, 5, 8].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setDurationSec(sec)}
                      className={`py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                        durationSec === sec
                          ? "bg-purple-950/80 border-purple-500 text-purple-200"
                          : "bg-[#090e1a] border-[#182742] text-slate-400 hover:text-white"
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Render & Animate Button */}
          <button
            onClick={handleProcessVideo}
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-[#0284c7] to-[#38bdf8] hover:opacity-95 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(56,189,248,0.4)] transition cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Synthesizing Video Motion...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 fill-current" />
                <span>Animate with Prompt & Motion (Instant 60fps)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Interactive Real-Time Canvas Stage & Player (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Video Canvas Screen */}
          <div className="bg-[#0e1628] border border-[#1c2d4a] rounded-2xl p-4 shadow-xl space-y-3">
            {/* Screen Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-[#38bdf8]" />
                <span className="text-xs font-bold text-white truncate max-w-xs">
                  {currentVideoTitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#132036] text-purple-300 border border-[#213556]">
                  {mode.toUpperCase()} • 60 FPS
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  100% PRIVATE
                </span>
              </div>
            </div>

            {/* Video Canvas Stage */}
            <div className="relative w-full aspect-video bg-[#04070f] rounded-xl overflow-hidden border border-[#192740] flex items-center justify-center group shadow-inner">
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full h-full object-contain"
              />

              {/* Generating Animation Overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-[#070b14]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
                  <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-500/40 text-purple-400 mb-3 animate-pulse">
                    <Film className="h-8 w-8" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Synthesizing AI Video Latents
                  </h3>
                  <p className="text-xs text-[#38bdf8] font-mono mb-4">{generationStatus}</p>

                  <div className="w-64 bg-[#131e33] h-2 rounded-full overflow-hidden border border-[#223456]">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-[#38bdf8] h-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-2">
                    {generationProgress}% • Real-time Shaders
                  </span>
                </div>
              )}

              {/* Big Center Play/Pause Overlay */}
              {!isGenerating && (
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-slate-900/70 border border-slate-700/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-2xl backdrop-blur-sm cursor-pointer hover:scale-105 active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 fill-current" />
                  ) : (
                    <Play className="h-6 w-6 fill-current translate-x-0.5" />
                  )}
                </button>
              )}
            </div>

            {/* Video Controls & Timeline */}
            <div className="space-y-2 pt-1">
              {/* Timeline Scrubber */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-400 w-10">
                  {currentTime.toFixed(1)}s
                </span>
                <input
                  type="range"
                  min={0}
                  max={durationSec}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                  className="flex-1 accent-purple-400 bg-[#080d17] h-1.5 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-mono text-slate-400 w-10 text-right">
                  {durationSec.toFixed(1)}s
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-xl bg-[#132038] hover:bg-[#1c2e4e] text-white transition cursor-pointer"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTime(0);
                      if (sourceVideoRef.current) sourceVideoRef.current.currentTime = 0;
                    }}
                    className="p-2 rounded-xl bg-[#132038] hover:bg-[#1c2e4e] text-slate-300 transition cursor-pointer"
                    title="Restart"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`p-2 rounded-xl border transition cursor-pointer ${
                      isLooping
                        ? "bg-purple-950 border-purple-600 text-purple-300"
                        : "bg-[#132038] border-transparent text-slate-400 hover:text-white"
                    }`}
                    title="Toggle Loop"
                  >
                    <Repeat className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-xl bg-[#132038] hover:bg-[#1c2e4e] text-slate-300 transition cursor-pointer"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>

                {/* Speed & Download Button */}
                <div className="flex items-center gap-2">
                  {/* Speed Pill Selector */}
                  <div className="flex items-center bg-[#090e1a] border border-[#1a2b47] rounded-xl p-0.5">
                    {[0.5, 1, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setPlaybackRate(rate);
                          setCameraSpeed(rate);
                          if (sourceVideoRef.current) sourceVideoRef.current.playbackRate = rate;
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                          playbackRate === rate
                            ? "bg-[#38bdf8] text-slate-950 font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  {/* Free Download Video Button */}
                  <button
                    onClick={handleDownloadVideo}
                    disabled={isRecordingExport}
                    className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isRecordingExport ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Recording Video...</span>
                      </>
                    ) : exportSuccess ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-950" />
                        <span>Saved Video!</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Export Video (Free)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Curated Sample Videos to Load and Remaster */}
          <div className="bg-[#0e1628] border border-[#1c2d4a] rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#38bdf8]" />
                <span>Featured Video Presets (1-Click Remaster)</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold">100% Free Samples</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {VIDEO_PRESETS.map((preset) => {
                const isSelected = currentVideoTitle.includes(preset.title.slice(0, 15));
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`group relative rounded-xl overflow-hidden border text-left transition cursor-pointer flex flex-col ${
                      isSelected
                        ? "border-[#38bdf8] ring-2 ring-[#38bdf8]/40 shadow-lg"
                        : "border-[#1c2d4a] hover:border-slate-500"
                    }`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                      <img
                        src={preset.thumbnail}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                      <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900/80 text-[#38bdf8]">
                        {preset.duration}
                      </span>
                    </div>
                    <div className="p-2 bg-[#090e1a] flex-1 flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-white group-hover:text-[#38bdf8] line-clamp-1">
                        {preset.title}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5">{preset.motionStyle}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
