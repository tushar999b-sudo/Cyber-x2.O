import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { AlertTriangle, Check, Copy } from "lucide-react";
import type { ChatMessage } from "../types/chat";
import { formatTime } from "../utils/format";
import CodeBlock from "./CodeBlock";

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const isError = message.isError === true;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const alignClass = isUser ? "self-end" : "self-start";
  const maxWidth = isUser ? "max-w-[85%] sm:max-w-[75%]" : "w-full";

  const CopyButton = () => (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy message"
      title="Copy message"
      className={[
        "flex size-6 shrink-0 items-center justify-center rounded-md transition-all",
        copied
          ? "bg-term-green/15 text-term-green"
          : "text-term-dim hover:bg-white/5 hover:text-term-cyan",
      ].join(" ")}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );

  // User bubble
  if (isUser) {
    return (
      <div className={`${alignClass} ${maxWidth} flex flex-col items-end gap-1`}>
        <div className="flex items-center gap-1.5 pr-1">
          <span className="text-[9px] font-medium tracking-wider text-term-dim">
            OPERATOR · {formatTime(message.createdAt)}
          </span>
          <CopyButton />
        </div>
        <div className="glass-panel rounded-[16px] border-term-cyan/20 bg-term-cyan/10 px-4 py-2.5 font-mono text-[12px] leading-relaxed text-slate-100">
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Error bubble
  if (isError) {
    return (
      <div className={`${alignClass} ${maxWidth} flex flex-col items-start gap-1`}>
        <div className="flex items-center gap-1.5 pl-1">
          <span className="flex items-center gap-1.5 text-[9px] font-medium tracking-wider text-term-red">
            <AlertTriangle size={10} /> SYSTEM ERROR · {formatTime(message.createdAt)}
          </span>
          <CopyButton />
        </div>
        <div className="glass-panel rounded-[16px] border-term-red/40 bg-term-red/5 px-4 py-3 font-mono text-[12px] leading-relaxed text-term-red">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className={`${alignClass} ${maxWidth} flex flex-col items-start gap-1`}>
      <div className="flex items-center gap-1.5 pl-1">
        <span className="text-[9px] font-medium tracking-wider text-term-green">
          CYBER-X · {formatTime(message.createdAt)}
        </span>
        <CopyButton />
      </div>
      <div className="w-full px-1 font-mono text-[12px] leading-[1.65] text-slate-200">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !className && !String(children).includes("\n");
              const value = String(children).replace(/\n$/, "");
              if (isInline) {
                return (
                  <code
                    className="rounded border border-border bg-white/5 px-1.5 py-0.5 text-term-cyan text-[11px]"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <CodeBlock
                  language={match ? match[1] : "text"}
                  value={value}
                />
              );
            },
            p({ children }) {
              return <p className="my-2 leading-relaxed">{children}</p>;
            },
            ul({ children }) {
              return (
                <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
              );
            },
            ol({ children }) {
              return (
                <ol className="my-2 list-decimal space-y-1 pl-5">
                  {children}
                </ol>
              );
            },
            h1({ children }) {
              return (
                <h1 className="mb-2 mt-4 text-[15px] font-bold text-term-cyan">
                  {children}
                </h1>
              );
            },
            h2({ children }) {
              return (
                <h2 className="mb-2 mt-3 text-[14px] font-bold text-term-cyan">
                  {children}
                </h2>
              );
            },
            h3({ children }) {
              return (
                <h3 className="mb-1 mt-2 text-[13px] font-bold text-term-cyan">
                  {children}
                </h3>
              );
            },
            a({ href, children }) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-term-cyan underline decoration-dotted underline-offset-2"
                >
                  {children}
                </a>
              );
            },
            blockquote({ children }) {
              return (
                <blockquote className="my-2 border-l-2 border-term-cyan/40 pl-3 italic text-term-dim">
                  {children}
                </blockquote>
              );
            },
            table({ children }) {
              return (
                <div className="my-2 overflow-x-auto">
                  <table className="border-collapse border border-border text-[11px]">
                    {children}
                  </table>
                </div>
              );
            },
            th({ children }) {
              return (
                <th className="border border-border bg-white/5 px-2 py-1 text-left text-term-cyan">
                  {children}
                </th>
              );
            },
            td({ children }) {
              return (
                <td className="border border-border px-2 py-1">
                  {children}
                </td>
              );
            },
            hr() {
              return <hr className="my-3 border-border" />;
            },
          }}
        >
          {message.content || "▋"}
        </ReactMarkdown>
      </div>
    </div>
  );
}