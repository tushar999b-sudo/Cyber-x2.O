import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  language: string;
  value: string;
}

export default function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API blocked — silently ignore
    }
  };

  return (
    <div className="my-3 border border-border rounded overflow-hidden bg-[#0b0f18]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-panel border-b border-border">
        <span className="text-[10px] uppercase tracking-wider text-term-cyan font-mono">
          {language || "text"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-term-dim hover:text-term-green transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} /> COPIED
            </>
          ) : (
            <>
              <Copy size={12} /> COPY
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto text-[12px] leading-[1.5]">
        <SyntaxHighlighter
          language={language || "text"}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "12px",
            background: "transparent",
            fontSize: "12px",
          }}
          codeTagProps={{
            style: {
              fontFamily:
                "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
            },
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}