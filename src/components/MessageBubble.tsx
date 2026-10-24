import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { AlertTriangle, Check, Copy, Terminal } from "lucide-react";
import type { ChatMessage } from "../types/chat";
import { formatTime } from "../utils/format";
import CodeBlock from "./CodeBlock";

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const isError = message.isError === true;
  const isSystem = message.role === "system";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  // System Message (Tool execution status)
  if (isSystem) {
    return (
      <div className="flex items-center gap-2 my-2 px-3 py-1.5 bg-[#1c1c1e] rounded-full w-fit text-[11px] text-blue-400 font-medium">
        <Terminal size={12} />
        {message.content}
      </div>
    );
  }

  // User Message
  if (isUser) {
    return (
      <div className="self-end max-w-[85%] sm:max-w-[75%] flex flex-col items-end gap-1.5 mt-6 mb-2">
        <div className="bg-[#2c2c2e] text-white px-5 py-3 rounded-2xl rounded-tr-sm text-[14px] leading-relaxed shadow-sm">
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    );
  }

  // AI Message (Hide the raw JSON tool call)
  const displayContent = message.content
    .replace(/\{[\s\S]*?"tool"[\s\S]*?\}/g, "")
    .trim();

  return (
    <div className="self-start w-full max-w-full flex flex-col items-start gap-1 mt-6 mb-2">
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center font-bold text-[11px]">
            X
          </div>
          <span className="text-[12px] font-semibold text-white tracking-wide">
            CYBER-X
          </span>
          <span className="text-[10px] text-text-muted">
            {formatTime(message.createdAt)}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-text-muted hover:text-white transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      <div className="text-[#e5e5e5] text-[14px] leading-relaxed w-full pl-8">
        {isError ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-start gap-2">
             <AlertTriangle size={16} className="mt-0.5 shrink-0" />
             <p>{message.content}</p>
          </div>
        ) : (
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
                      className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[13px] font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                return <CodeBlock language={match ? match[1] : "text"} value={value} />;
              },
              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
              h1: ({ children }) => <h1 className="text-lg font-bold text-white mt-4 mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold text-white mt-3 mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold text-white mt-2 mb-1">{children}</h3>,
              a: ({ href, children }) => <a href={href} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{children}</a>,
              table: ({ children }) => <div className="overflow-x-auto my-3 border border-border rounded-lg"><table className="w-full text-left border-collapse text-xs">{children}</table></div>,
              th: ({ children }) => <th className="bg-panel px-3 py-2 border-b border-border font-semibold text-white">{children}</th>,
              td: ({ children }) => <td className="px-3 py-2 border-b border-border text-gray-300">{children}</td>,
            }}
          >
            {displayContent || (isError ? "" : "▋")}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
