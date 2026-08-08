# Browser AI Companion

You are an expert Principal AI Software Architect specializing in WebGPU, browser-based LLM execution engines, and modern client-side application design.



Your task is to generate the complete source code for "BroAI" — a private, 100% client-side web application that runs local LLMs directly inside the user's browser using WebGPU and `@mlc-ai/web-llm`.



### TECHNICAL SPECIFICATIONS & CONSTRAINTS



1. SINGLE-FILE ARCHITECTURE:

   - Output must be a single, production-grade, self-contained `index.html` file.

   - External dependencies must be imported via CDNs/ESM modules:

     - Tailwind CSS (v3 CDN)

     - Lucide Icons

     - Marked.js (Markdown parsing)

     - Highlight.js (Code block syntax highlighting with atom-one-dark theme)

     - DOMPurify (XSS prevention)

     - WebLLM via ES Module: `https://esm.run/@mlc-ai/web-llm`



2. MODEL SELECTION & GPU EXECUTION:

   - Provide a model selection dropdown grouped into "Fast & Light Models" and "Mid & Logic Models".

   - Target low-footprint models suitable for client-side VRAM:

     - Qwen 2.5 0.5B

     - Qwen 3.5 0.8B

     - Gemma 3n

     - SmolLM2 1.7B / SmolLM3 3B

     - Llama 3.2 1B / 3B

     - Phi-3.5 Mini / Phi-4 Mini Instruct

   - Include a robust fallback mechanism mapping experimental/unsupported model IDs to available MLC weight builds.

   - Display WebGPU hardware acceleration status, real-time JS heap/RAM usage, and generation speed in tokens per second (t/s).



3. USER INTERFACE & COMPONENT DESIGN:

   - Modern, responsive dark/light mode layout (Tailwind CSS).

   - Top Header: Navigation, Model Selector with load state button, Theme toggle, and Sandbox toggle.

   - Slide-out Sidebar: Conversation history listing with 'New Chat' creation, auto-titling based on prompt context, and session deletion persisted via `localStorage`.

   - Download/Progress Banner: Real-time progress bar tracking weight downloads into browser IndexedDB cache.

   - Chat Workspace: Smooth auto-scroll streaming responses, rich markdown output, and formatted code blocks.



4. INTERACTIVE JAVASCRIPT SANDBOX:

   - Slide-out drawer/panel for JavaScript code execution.

   - Code blocks generated in assistant responses must feature a "Run in Sandbox" button that auto-populates the sandbox editor.

   - Custom terminal console capturing `console.log`, `console.warn`, and `console.error` outputs safely inside a scoped sandbox function.



5. SECURITY & RELIABILITY:

   - Sanitize all rendered Markdown HTML using `DOMPurify`.

   - Graceful WebGPU browser capability detection and user notification toasts.



Deliver strictly executable, fully functional, clean HTML code containing no placeholder snippets or omitted methods.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b5f17d17-c3c6-4953-aa07-d9bcd2e7dd4a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
