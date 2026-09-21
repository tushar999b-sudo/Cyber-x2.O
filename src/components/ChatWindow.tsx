import { useRef } from "react";
import type { ChatMessage } from "../types/chat";
import { useAutoScroll } from "../hooks/useAutoScroll";
import EmptyState from "./EmptyState";
import MessageBubble from "./MessageBubble";

interface ChatWindowProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  mode?: string;
}

export default function ChatWindow({
  messages,
  isStreaming,
  mode,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useAutoScroll(scrollRef, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div ref={scrollRef} className="h-full overflow-y-auto">
        <EmptyState mode={mode} />
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex h-full flex-col gap-4 overflow-y-auto px-1 py-4"
    >
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}

      {isStreaming && messages[messages.length - 1]?.content === "" && (
        <div className="self-start flex items-center gap-2 text-[11px] font-mono text-term-cyan">
          <span className="size-1.5 rounded-full bg-term-cyan animate-signal-pulse" />
          PROCESSING...
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}