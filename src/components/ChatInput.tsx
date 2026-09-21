import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Mic, Square } from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import {
  filterCommands,
  type SlashCommand,
} from "../config/slashCommands";
import SlashMenu from "./SlashMenu";

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

  const [slashOpen, setSlashOpen] = useState(false);
  const [slashIndex, setSlashIndex] = useState(0);

  const {
    isSupported: micSupported,
    isListening,
    transcript,
    error: micError,
    toggle: toggleMic,
  } = useSpeechRecognition({
    lang: "en-US",
    onResult: (text) => {
      const next = (value + " " + text).trim();
      onChange(next);
    },
  });

  // Detect slash trigger: value starts with "/" and no space yet
  const slashQuery = useMemo(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      return value.slice(1);
    }
    return null;
  }, [value]);

  const filtered = useMemo(
    () => (slashQuery !== null ? filterCommands(slashQuery) : []),
    [slashQuery]
  );

  useEffect(() => {
    setSlashOpen(slashQuery !== null && filtered.length > 0);
    setSlashIndex(0);
  }, [slashQuery, filtered.length]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
  }, [value]);

  const handleSlashSelect = (cmd: SlashCommand) => {
    setSlashOpen(false);
    if (cmd.instant && cmd.instantPrompt) {
      onChange("");
      onSend(cmd.instantPrompt);
      return;
    }
    if (cmd.template) {
      onChange(cmd.template);
      // Focus textarea and move cursor to end
      requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(cmd.template!.length, cmd.template!.length);
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Slash menu keyboard handling
    if (slashOpen && filtered.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIndex((i) => (i + 1) % filtered.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex((i) => (i - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSlashSelect(filtered[slashIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setSlashOpen(false);
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        // Autocomplete the trigger
        const cmd = filtered[slashIndex];
        onChange(cmd.trigger + " ");
        setSlashOpen(false);
        return;
      }
    }

    // Normal send
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && value.trim()) onSend();
    }
  };

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <div className="px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
      <div className="relative">
        {slashOpen && (
          <SlashMenu
            commands={filtered}
            activeIndex={slashIndex}
            onSelect={handleSlashSelect}
            onHover={setSlashIndex}
          />
        )}

        <div
          className={[
            "glass-panel relative flex min-h-[60px] items-center gap-2 rounded-full px-2 shadow-2xl transition-all",
            isListening ? "ring-2 ring-term-red/50" : "",
          ].join(" ")}
        >
          {micSupported && (
            <button
              type="button"
              onClick={toggleMic}
              aria-label={
                isListening ? "Stop voice input" : "Start voice input"
              }
              title={isListening ? "Stop listening" : "Voice input"}
              className={[
                "flex size-9 shrink-0 items-center justify-center rounded-full transition-all",
                isListening
                  ? "bg-term-red text-white shadow-[0_0_14px_rgba(244,63,94,0.6)]"
                  : "glass-control text-term-dim hover:text-term-cyan",
              ].join(" ")}
            >
              <Mic size={16} />
            </button>
          )}

          <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? "Listening..."
                : micSupported
                ? "Enter command or / for commands..."
                : "Enter command or / for commands..."
            }
            rows={1}
            disabled={isStreaming}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="min-h-[52px] max-h-24 flex-1 resize-none bg-transparent py-4 font-mono text-[12px] leading-relaxed text-slate-100 outline-none placeholder:text-term-dim/70 disabled:opacity-60"
          />

          {isStreaming ? (
            <button
              onClick={onStop}
              aria-label="Stop generation"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-term-red text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-colors hover:bg-red-500"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={() => onSend()}
              disabled={!canSend}
              aria-label="Send command"
              className={[
                "flex size-10 shrink-0 items-center justify-center rounded-full transition-all",
                canSend
                  ? "bg-term-cyan text-slate-900 shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:bg-term-green"
                  : "bg-white/5 text-term-dim",
              ].join(" ")}
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {isListening && (
        <p className="mx-auto mt-2 max-w-3xl px-2 text-center text-[10px] text-term-red">
          🎤 Listening{transcript ? `: "${transcript}"` : "..."}
        </p>
      )}

      {micError && !isListening && (
        <p className="mx-auto mt-2 max-w-3xl px-2 text-center text-[10px] text-term-red/80">
          Mic error: {micError}
        </p>
      )}
    </div>
  );
}