import { useEffect, useRef } from "react";
import { ArrowUp, Square, Paperclip } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: (override?: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
}: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && value.trim()) onSend();
    }
  };

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <div className="p-4 bg-bg border-t border-border/50">
      <div className="max-w-3xl mx-auto relative bg-[#1c1c1e] rounded-[24px] transition-all duration-200 focus-within:bg-[#2c2c2e] shadow-lg">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message CYBER-X..."
          rows={1}
          disabled={isStreaming}
          className="w-full bg-transparent px-5 py-4 pr-24 text-sm text-white placeholder-text-muted outline-none focus:outline-none focus:ring-0 resize-none"
          spellCheck={false}
        />
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <button className="p-2 text-text-muted hover:text-white transition-colors rounded-full hover:bg-white/10">
            <Paperclip size={18} />
          </button>
          {isStreaming ? (
            <button
              onClick={onStop}
              className="p-2.5 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={() => onSend()}
              disabled={!canSend}
              className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
                canSend
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-white/10 text-text-muted cursor-not-allowed"
              }`}
            >
              <ArrowUp size={16} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
