import React, { useState } from "react";
import { Copy, Check, Sparkles, Terminal, Brain, ChevronDown } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  onRunInSandbox?: (code: string) => void;
}

// Subcomponent for DeepSeek R1 / Reasoning Models Chain of Thought
const ThinkingBlock: React.FC<{ thinkingText: string }> = ({ thinkingText }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const tokenCount = Math.max(12, Math.round(thinkingText.length / 3.8));

  return (
    <div className="rounded-xl border border-violet-900/40 bg-violet-950/20 my-3 overflow-hidden shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2 flex items-center justify-between text-xs text-violet-300 hover:text-violet-100 hover:bg-violet-950/40 transition cursor-pointer border-b border-violet-900/30"
      >
        <div className="flex items-center gap-2 font-mono font-medium">
          <Brain className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
          <span>Thought Process</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-900/50 text-violet-200 border border-violet-700/40">
            ~{tokenCount} reasoning tokens
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-violet-400 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="p-3.5 text-xs text-slate-300/90 font-mono leading-relaxed bg-[#070b14]/80 whitespace-pre-wrap border-t border-violet-950/50">
          {thinkingText.trim()}
        </div>
      )}
    </div>
  );
};

// Convert LaTeX math tokens to clean typography and unicode
function formatLatexMath(latex: string): React.ReactNode {
  let cleaned = latex.trim();

  // Strip enclosing delimiters if present
  if (cleaned.startsWith("$$") && cleaned.endsWith("$$")) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith("$") && cleaned.endsWith("$")) {
    cleaned = cleaned.slice(1, -1).trim();
  } else if (cleaned.startsWith("\\[") && cleaned.endsWith("\\]")) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith("\\(") && cleaned.endsWith("\\)")) {
    cleaned = cleaned.slice(2, -2).trim();
  }

  // Replace \text{...}, \mathrm{...}, \mathbf{...}
  cleaned = cleaned.replace(/\\(text|mathrm|mathbf)\{([^}]+)\}/g, "$2");

  // Replace common LaTeX symbols
  const symbolMap: Record<string, string> = {
    "\\approx": "≈",
    "\\times": "×",
    "\\cdot": "·",
    "\\pm": "±",
    "\\mp": "∓",
    "\\leq": "≤",
    "\\le": "≤",
    "\\geq": "≥",
    "\\ge": "≥",
    "\\neq": "≠",
    "\\infty": "∞",
    "\\alpha": "α",
    "\\beta": "β",
    "\\gamma": "γ",
    "\\delta": "δ",
    "\\Delta": "Δ",
    "\\theta": "θ",
    "\\lambda": "λ",
    "\\mu": "μ",
    "\\pi": "π",
    "\\Pi": "Π",
    "\\sigma": "σ",
    "\\Sigma": "Σ",
    "\\omega": "ω",
    "\\Omega": "Ω",
    "\\partial": "∂",
    "\\nabla": "∇",
    "\\sqrt": "√",
    "\\to": "→",
    "\\rightarrow": "→",
    "\\leftarrow": "←",
    "\\quad": "  ",
    "\\qquad": "    ",
    "\\,": " ",
    "\\;": " ",
  };

  for (const [tex, sym] of Object.entries(symbolMap)) {
    cleaned = cleaned.split(tex).join(sym);
  }

  // Handle \frac{a}{b} -> (a / b)
  cleaned = cleaned.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)");

  // Handle superscripts: ^{...} or ^x
  const supMap: Record<string, string> = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "+": "⁺",
    "-": "⁻",
    "=": "⁼",
    "(": "⁽",
    ")": "⁾",
    n: "ⁿ",
    i: "ⁱ",
    x: "ˣ",
    y: "ʸ",
  };

  cleaned = cleaned.replace(/\^\{([^}]+)\}/g, (_, exp) => {
    return exp
      .split("")
      .map((c: string) => supMap[c] || c)
      .join("");
  });

  cleaned = cleaned.replace(/\^([0-9a-zA-Z+-])/g, (_, char) => {
    return supMap[char] || `^${char}`;
  });

  // Handle subscripts: _{...} or _x
  const subMap: Record<string, string> = {
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉",
    "+": "₊",
    "-": "₋",
    "=": "₌",
    "(": "₍",
    ")": "₎",
    a: "ₐ",
    e: "ₑ",
    o: "ₒ",
    x: "ₓ",
    i: "ᵢ",
    j: "ⱼ",
  };

  cleaned = cleaned.replace(/_\{([^}]+)\}/g, (_, sub) => {
    return sub
      .split("")
      .map((c: string) => subMap[c] || c)
      .join("");
  });

  cleaned = cleaned.replace(/_([0-9a-zA-Z+-])/g, (_, char) => {
    return subMap[char] || `_${char}`;
  });

  return (
    <span className="inline-flex items-baseline font-serif italic text-[#38bdf8] font-medium tracking-wide mx-0.5 bg-[#0b1424]/90 px-1.5 py-0.5 rounded border border-[#1b2b45] text-[13px] select-text">
      {cleaned}
    </span>
  );
}

// Parses inline text for bold (**text**), italics (*text*), inline code (`code`), math ($...$), and links
function renderInlineElements(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  // Match:
  // 1. Inline math: $...$ or \(...\)
  // 2. Bold: **...** or __...__
  // 3. Inline code: `...`
  // 4. Links: [text](url)
  // 5. Italic: *...* or _..._
  const inlineRegex =
    /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\(.+?\\\)|`[^`\n]+?`|\*\*[^*]+?\*\*|__[^_]+?__|\[[^\]]+?\]\([^)]+?\)|(?<!\*)\*[^*]+?\*(?!\*))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(text)) !== null) {
    // Push preceding text
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    // Math: $$...$$ or $...$ or \(...\)
    if (
      (token.startsWith("$") && token.endsWith("$")) ||
      (token.startsWith("\\(") && token.endsWith("\\)"))
    ) {
      elements.push(<React.Fragment key={match.index}>{formatLatexMath(token)}</React.Fragment>);
    }
    // Inline code: `...`
    else if (token.startsWith("`") && token.endsWith("`")) {
      const code = token.slice(1, -1);
      elements.push(
        <code
          key={match.index}
          className="bg-[#0e1726] text-[#38bdf8] px-1.5 py-0.5 rounded text-xs font-mono border border-[#1e2e48] mx-0.5"
        >
          {code}
        </code>,
      );
    }
    // Bold: **...** or __...__
    else if (
      (token.startsWith("**") && token.endsWith("**")) ||
      (token.startsWith("__") && token.endsWith("__"))
    ) {
      const boldText = token.slice(2, -2);
      // Recursively parse inline inside bold (e.g. **$E$ (Energy):**)
      elements.push(
        <strong key={match.index} className="font-bold text-white tracking-tight">
          {renderInlineElements(boldText)}
        </strong>,
      );
    }
    // Link: [text](url)
    else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        elements.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="text-[#38bdf8] hover:underline font-medium inline-flex items-center gap-0.5"
          >
            {linkMatch[1]}
          </a>,
        );
      } else {
        elements.push(token);
      }
    }
    // Italic: *...*
    else if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      const italicText = token.slice(1, -1);
      elements.push(
        <em key={match.index} className="italic text-slate-200">
          {renderInlineElements(italicText)}
        </em>,
      );
    } else {
      elements.push(token);
    }

    lastIndex = match.index + token.length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : [text];
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onRunInSandbox }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Check for <think>...</think> or streaming <think>...
  let thinkingContent: string | null = null;
  let mainContent = content;

  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  if (thinkMatch) {
    thinkingContent = thinkMatch[1];
    mainContent = content.replace(/<think>[\s\S]*?<\/think>/, "").trim();
  } else if (content.startsWith("<think>")) {
    // During active streaming before closing tag
    thinkingContent = content.slice(7);
    mainContent = "";
  }

  // Split content by code blocks (```...```) and block math ($$...$$ or \[...\])
  const blockRegex = /(```[\s\S]*?```|\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g;
  const blocks = mainContent.split(blockRegex);

  return (
    <div className="space-y-3 leading-relaxed text-slate-200 text-sm select-text">
      {thinkingContent && <ThinkingBlock thinkingText={thinkingContent} />}

      {blocks.map((block, bIdx) => {
        if (!block) return null;

        // 1. Code Block
        if (block.startsWith("```")) {
          const match = block.match(/```(\w+)?\n([\s\S]*?)```/);
          const lang = match?.[1] || "text";
          const code = match?.[2] || block.slice(3, -3);

          return (
            <div
              key={bIdx}
              className="rounded-xl overflow-hidden border border-[#20304a] bg-[#090e18] my-3 shadow-inner"
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#121c2d] border-b border-[#1f2e47] text-xs text-slate-400 font-mono">
                <span className="uppercase text-[11px] font-semibold text-[#38bdf8]">{lang}</span>
                <div className="flex items-center gap-2">
                  {onRunInSandbox && (
                    <button
                      onClick={() => onRunInSandbox(code)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-950/70 hover:bg-blue-900/80 text-[#38bdf8] text-[11px] font-medium transition cursor-pointer border border-blue-800/40"
                    >
                      <Sparkles className="h-3 w-3" />
                      Run in Sandbox
                    </button>
                  )}
                  <button
                    onClick={() => copyToClipboard(code, bIdx)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#1b283f] hover:bg-[#233555] text-slate-300 text-[11px] transition cursor-pointer"
                  >
                    {copiedIdx === bIdx ? (
                      <>
                        <Check className="h-3 w-3 text-green-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre className="p-3.5 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed bg-[#080d16]">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // 2. Standalone Block Math ($$...$$ or \[...\])
        if (
          (block.startsWith("$$") && block.endsWith("$$")) ||
          (block.startsWith("\\[") && block.endsWith("\\]"))
        ) {
          return (
            <div
              key={bIdx}
              className="my-3 p-3.5 bg-[#091222] border border-[#1b2d49] rounded-xl flex flex-col items-center justify-center text-center shadow-md overflow-x-auto"
            >
              <div className="text-xs font-mono uppercase text-[#38bdf8] mb-1 opacity-75 flex items-center gap-1">
                <Terminal className="h-3 w-3" />
                <span>Formula</span>
              </div>
              <div className="text-sm sm:text-base font-serif italic text-white my-1">
                {formatLatexMath(block)}
              </div>
            </div>
          );
        }

        // 3. Regular Markdown Lines (Headers, Bullet lists, Numbered lists, Blockquotes, Paragraphs)
        const lines = block.split("\n");
        return (
          <div key={bIdx} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();

              if (!trimmed) {
                return <div key={lIdx} className="h-1" />;
              }

              // Horizontal Rule
              if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
                return <hr key={lIdx} className="border-[#18263e] my-3" />;
              }

              // H1: # Heading
              if (line.startsWith("# ")) {
                return (
                  <h1
                    key={lIdx}
                    className="text-base sm:text-lg font-bold text-white mt-4 mb-2 pb-1 border-b border-[#1b2a42]"
                  >
                    {renderInlineElements(line.slice(2))}
                  </h1>
                );
              }

              // H2: ## Heading
              if (line.startsWith("## ")) {
                return (
                  <h2
                    key={lIdx}
                    className="text-sm sm:text-base font-bold text-[#38bdf8] mt-3.5 mb-1.5 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-3.5 bg-[#38bdf8] rounded-full inline-block" />
                    {renderInlineElements(line.slice(3))}
                  </h2>
                );
              }

              // H3: ### Heading
              if (line.startsWith("### ")) {
                return (
                  <h3
                    key={lIdx}
                    className="text-xs sm:text-sm font-semibold text-slate-100 mt-2.5 mb-1 tracking-tight"
                  >
                    {renderInlineElements(line.slice(4))}
                  </h3>
                );
              }

              // H4: #### Heading
              if (line.startsWith("#### ")) {
                return (
                  <h4
                    key={lIdx}
                    className="text-xs font-semibold text-slate-300 uppercase tracking-wider mt-2 mb-0.5"
                  >
                    {renderInlineElements(line.slice(5))}
                  </h4>
                );
              }

              // Bullet List Item: * item or - item
              if (
                line.startsWith("* ") ||
                line.startsWith("- ") ||
                trimmed.startsWith("* ") ||
                trimmed.startsWith("- ")
              ) {
                const itemContent = trimmed.slice(2);
                return (
                  <div key={lIdx} className="flex items-start gap-2 text-slate-200 pl-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] mt-2 flex-shrink-0" />
                    <span className="flex-1">{renderInlineElements(itemContent)}</span>
                  </div>
                );
              }

              // Numbered List Item: 1. item, 2. item, etc.
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 text-slate-200 pl-1.5">
                    <span className="font-mono text-xs font-bold text-[#38bdf8] min-w-[18px] mt-0.5">
                      {numMatch[1]}.
                    </span>
                    <span className="flex-1">{renderInlineElements(numMatch[2])}</span>
                  </div>
                );
              }

              // Blockquote: > quote
              if (trimmed.startsWith("> ")) {
                return (
                  <div
                    key={lIdx}
                    className="border-l-2 border-[#38bdf8] pl-3 py-1 text-slate-300 italic my-2 bg-[#09111e]/60 rounded-r-lg"
                  >
                    {renderInlineElements(trimmed.slice(2))}
                  </div>
                );
              }

              // Normal Paragraph Line
              return (
                <p key={lIdx} className="leading-relaxed">
                  {renderInlineElements(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
