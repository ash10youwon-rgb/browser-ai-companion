import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BroAI — Private Local LLMs in Your Browser" },
      {
        name: "description",
        content:
          "BroAI runs open LLMs 100% locally in your browser with WebGPU. No servers, no tracking, full privacy.",
      },
      { property: "og:title", content: "BroAI — Private Local LLMs in Your Browser" },
      {
        property: "og:description",
        content:
          "Chat with Qwen, Llama, Phi and Gemma models fully offline on your GPU, with a built-in JavaScript sandbox.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/broai.html"
      title="BroAI local LLM workspace"
      className="fixed inset-0 h-full w-full border-0"
      allow="cross-origin-isolated"
    />
  );
}
