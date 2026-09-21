import { useState } from "react";
import { STORAGE_KEYS } from "../config/appConfig";
import { useChat } from "../hooks/useChat";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSettings } from "../hooks/useSettings";
import { exportBundle } from "../lib/zipExport";
import type { Mode } from "../types/settings";
import ChatInput from "../components/ChatInput";
import ChatWindow from "../components/ChatWindow";
import Header from "../components/Header";
import ModeSelector from "../components/ModeSelector";
import SettingsModal from "../components/SettingsModal";
import Sidebar from "../components/Sidebar";
import Toolbox from "../components/Toolbox";

export default function TerminalPage() {
  const [mode, setMode] = useLocalStorage<Mode>(STORAGE_KEYS.mode, "PENTEST");

  const {
    settings,
    apiKey,
    resolvedModel,
    providerConfig,
    updateSetting,
    setApiKey,
    clearKey,
    resetAll,
  } = useSettings();

  const {
    conversations,
    active,
    activeId,
    isStreaming,
    sendMessage,
    stopGeneration,
    startNewSession,
    selectConversation,
    deleteConversation,
    clearAll,
    exportJSON,
    exportMarkdown,
  } = useChat({
    baseUrl: providerConfig.baseUrl,
    model: resolvedModel,
    apiKey,
    temperature: settings.temperature,
    mode,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [input, setInput] = useState("");

  const status: "idle" | "streaming" | "error" = isStreaming
    ? "streaming"
    : active?.messages.some((m) => m.isError)
    ? "error"
    : "idle";

  const handleSend = (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || isStreaming) return;
    if (!override) setInput("");
    void sendMessage(text);
  };

  const handleClear = () => {
    if (!active) return;
    const ok = window.confirm("Clear the current conversation?");
    if (ok) deleteConversation(active.id);
  };

  const handleExportSource = async () => {
    await exportBundle({ conversations, settings, mode });
  };

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden font-mono text-slate-100">
      <div
        aria-hidden="true"
        className="grid-texture pointer-events-none absolute inset-0 z-0"
      />

      <Sidebar
        conversations={conversations}
        activeId={activeId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={selectConversation}
        onDelete={deleteConversation}
        onNew={startNewSession}
      />

      <div className="relative z-10 flex h-full min-w-0 flex-1 flex-col">
        <Header
          status={status}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenToolbox={() => setToolboxOpen(true)}
          onClear={handleClear}
          onNewSession={startNewSession}
        />

        <ModeSelector mode={mode} onChange={setMode} />

        <div className="min-h-0 flex-1 overflow-hidden px-3 pt-2">
          <ChatWindow
            messages={active?.messages ?? []}
            isStreaming={isStreaming}
            mode={mode}
          />
        </div>

        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onStop={stopGeneration}
          isStreaming={isStreaming}
        />
      </div>

      <Toolbox isOpen={toolboxOpen} onClose={() => setToolboxOpen(false)} />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        updateSetting={updateSetting}
        apiKey={apiKey}
        setApiKey={setApiKey}
        clearKey={clearKey}
        resetAll={resetAll}
        onExportConversations={exportJSON}
        onExportMarkdown={exportMarkdown}
        onClearConversations={clearAll}
        onExportSourceZip={handleExportSource}
        resolvedModel={resolvedModel}
        baseUrl={providerConfig.baseUrl}
      />
    </div>
  );
}