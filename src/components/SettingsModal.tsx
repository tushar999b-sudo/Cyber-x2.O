import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { useState } from "react";
import { APP_VERSION, PROVIDERS } from "../config/appConfig";
import { testConnection } from "../services/llmService";
import type { Settings } from "../types/settings";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  clearKey: () => void;
  resetAll: () => void;
  onExportConversations: () => void;
  onExportMarkdown: () => void;
  onClearConversations: () => void;
  onExportSourceZip: () => void;
  resolvedModel: string;
  baseUrl: string;
}

type Section = "model" | "appearance" | "data" | "about";

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  updateSetting,
  apiKey,
  setApiKey,
  clearKey,
  resetAll,
  onExportConversations,
  onExportMarkdown,
  onClearConversations,
  onExportSourceZip,
  resolvedModel,
  baseUrl,
}: Props) {
  const [section, setSection] = useState<Section>("model");
  const [showKey, setShowKey] = useState(false);
  const [keyDraft, setKeyDraft] = useState(apiKey);
  const [testState, setTestState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ok"; model?: string }
    | { status: "error"; error: string }
  >({ status: "idle" });

  if (!isOpen) return null;

  const provider = PROVIDERS[settings.provider] ?? PROVIDERS.groq;

  const handleSaveKey = () => {
    setApiKey(keyDraft.trim());
    setTestState({ status: "idle" });
  };

  const handleTest = async () => {
    setTestState({ status: "loading" });
    const result = await testConnection({
      baseUrl,
      model: resolvedModel,
      apiKey: keyDraft.trim() || apiKey,
    });
    if (result.ok) {
      setTestState({ status: "ok", model: result.model ?? resolvedModel });
    } else {
      setTestState({
        status: "error",
        error: result.error ?? "Connection failed.",
      });
    }
  };

  const sections: { id: Section; label: string }[] = [
    { id: "model", label: "MODEL" },
    { id: "appearance", label: "APPEARANCE" },
    { id: "data", label: "DATA" },
    { id: "about", label: "ABOUT" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-panel flex max-h-[90vh] w-full max-w-lg flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold tracking-wider text-term-cyan">
              SETTINGS
            </h2>
            <p className="text-[10px] text-term-dim">
              CYBER-X 2.0 · v{APP_VERSION}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-md p-1 text-term-dim transition-colors hover:text-term-red"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-white/10 px-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={[
                "whitespace-nowrap border-b-2 px-3 py-2 text-[11px] font-medium tracking-wider transition-colors",
                section === s.id
                  ? "border-term-cyan text-term-cyan"
                  : "border-transparent text-term-dim hover:text-slate-100",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 text-[12px]">
          {section === "model" && (
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-term-dim">
                Provider
              </label>
              <select
                value={settings.provider}
                onChange={(e) => updateSetting("provider", e.target.value)}
                className="glass-control w-full rounded-lg px-2 py-1.5 text-slate-100 outline-none focus:border-term-cyan/60"
              >
                {Object.values(PROVIDERS).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>

              <label className="mb-1 mt-4 block text-[10px] uppercase tracking-wider text-term-dim">
                Model
              </label>
              <select
                value={settings.model}
                onChange={(e) => updateSetting("model", e.target.value)}
                className="glass-control w-full rounded-lg px-2 py-1.5 text-slate-100 outline-none focus:border-term-cyan/60"
              >
                {provider.models.map((m) => (
                  <option key={m} value={m}>
                    {m === "custom" ? "custom (enter below)" : m}
                  </option>
                ))}
              </select>

              {settings.model === "custom" && (
                <input
                  type="text"
                  value={settings.customModel}
                  onChange={(e) => updateSetting("customModel", e.target.value)}
                  placeholder="model-id"
                  className="glass-control mt-2 w-full rounded-lg px-2 py-1.5 text-slate-100 outline-none focus:border-term-cyan/60"
                />
              )}

              <label className="mb-1 mt-4 block text-[10px] uppercase tracking-wider text-term-dim">
                Temperature: {settings.temperature.toFixed(2)}
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.temperature}
                onChange={(e) =>
                  updateSetting("temperature", parseFloat(e.target.value))
                }
                className="w-full accent-term-cyan"
              />

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-term-dim">
                  Streaming
                </span>
                <button
                  onClick={() => updateSetting("streaming", !settings.streaming)}
                  className={[
                    "rounded-lg border px-3 py-1 text-[10px] tracking-wider transition-colors",
                    settings.streaming
                      ? "border-term-green/60 text-term-green"
                      : "border-white/10 text-term-dim",
                  ].join(" ")}
                >
                  {settings.streaming ? "ON" : "OFF"}
                </button>
              </div>

              {/* API KEY */}
              <div className="mt-6 border-t border-white/10 pt-4">
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-term-dim">
                  {provider.keyLabel}
                </label>
                <div className="glass-control flex items-center rounded-lg px-2 focus-within:border-term-cyan/60">
                  <input
                    type={showKey ? "text" : "password"}
                    value={keyDraft}
                    onChange={(e) => setKeyDraft(e.target.value)}
                    placeholder={provider.keyPlaceholder}
                    spellCheck={false}
                    autoComplete="off"
                    className="flex-1 bg-transparent py-1.5 text-slate-100 outline-none"
                  />
                  <button
                    onClick={() => setShowKey((v) => !v)}
                    aria-label="Toggle key visibility"
                    className="p-1 text-term-dim transition-colors hover:text-slate-100"
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleSaveKey}
                    className="flex-1 rounded-lg border border-term-green/60 px-3 py-1.5 text-[11px] text-term-green transition-colors hover:bg-term-green/10"
                  >
                    SAVE KEY
                  </button>
                  <button
                    onClick={handleTest}
                    disabled={testState.status === "loading"}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-term-cyan/60 px-3 py-1.5 text-[11px] text-term-cyan transition-colors hover:bg-term-cyan/10 disabled:opacity-50"
                  >
                    {testState.status === "loading" ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> TESTING
                      </>
                    ) : (
                      "TEST CONNECTION"
                    )}
                  </button>
                </div>

                {testState.status === "ok" && (
                  <div className="mt-2 rounded-lg border border-term-green/40 bg-term-green/5 px-2 py-1.5 text-[11px] text-term-green">
                    ✓ Connected — {testState.model}
                  </div>
                )}

                {testState.status === "error" && (
                  <div className="mt-2 rounded-lg border border-term-red/40 bg-term-red/5 px-2 py-1.5 text-[11px] text-term-red">
                    {testState.error}
                  </div>
                )}

                <p className="mt-2 text-[10px] leading-relaxed text-term-dim">
                  Key is stored locally in your browser only. It is sent only
                  to the provider endpoint.
                </p>
              </div>
            </div>
          )}

          {section === "appearance" && (
            <div>
              <label className="mb-2 block text-[10px] uppercase tracking-wider text-term-dim">
                Density
              </label>
              <div className="flex gap-2">
                {(["comfortable", "compact"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => updateSetting("density", d)}
                    className={[
                      "flex-1 rounded-lg border px-3 py-2 text-[11px] uppercase tracking-wider transition-colors",
                      settings.density === d
                        ? "border-term-cyan/60 bg-term-cyan/5 text-term-cyan"
                        : "border-white/10 text-term-dim hover:text-slate-100",
                    ].join(" ")}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-term-dim">
                Density affects message padding and line spacing.
              </p>
            </div>
          )}

          {section === "data" && (
            <div className="space-y-2">
              <DataButton
                label="EXPORT CURRENT CHAT (MARKDOWN)"
                onClick={onExportMarkdown}
              />
              <DataButton
                label="EXPORT ALL CONVERSATIONS (JSON)"
                onClick={onExportConversations}
              />
              <DataButton
                label="EXPORT SOURCE ZIP"
                onClick={onExportSourceZip}
              />
              <DataButton
                label="CLEAR CONVERSATIONS"
                onClick={() => {
                  if (
                    confirm("Delete all conversations? This cannot be undone.")
                  ) {
                    onClearConversations();
                  }
                }}
                danger
              />
              <DataButton
                label="CLEAR API KEY"
                onClick={() => {
                  if (confirm("Remove the stored API key?")) {
                    setKeyDraft("");
                    clearKey();
                  }
                }}
                danger
              />
              <DataButton
                label="RESET APP"
                onClick={() => {
                  if (
                    confirm(
                      "Reset everything: settings, conversations, API key?"
                    )
                  ) {
                    setKeyDraft("");
                    resetAll();
                  }
                }}
                danger
              />
            </div>
          )}

          {section === "about" && (
            <div className="text-slate-200">
              <p className="mb-2 text-sm text-term-cyan">CYBER-X 2.0</p>
              <p className="mb-4 text-[11px] text-term-dim">
                Security Operations Terminal · v{APP_VERSION}
              </p>
              <p className="mb-3 text-[11px] leading-relaxed">
                Client-side React + TypeScript app. Connects to any
                OpenAI-compatible chat endpoint (Groq by default) using a
                user-supplied API key.
              </p>
              <p className="text-[11px] leading-relaxed text-term-dim">
                No backend. No telemetry. All data stays in your browser's
                localStorage.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DataButton({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full rounded-lg border px-3 py-2 text-left text-[11px] tracking-wider transition-colors",
        danger
          ? "border-term-red/40 text-term-red hover:bg-term-red/10"
          : "border-white/10 text-term-green hover:border-term-cyan/60 hover:bg-term-cyan/5",
      ].join(" ")}
    >
      {label}
    </button>
  );
}