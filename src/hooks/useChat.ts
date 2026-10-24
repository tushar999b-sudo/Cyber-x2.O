import { useCallback, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  BASE_SYSTEM_PROMPT,
  MODE_ADDENDA,
  STORAGE_KEYS,
} from "../config/appConfig";
import { streamChat } from "../services/llmService";
import type { ChatMessage, Conversation } from "../types/chat";
import type { Mode } from "../types/settings";
import { messageForError } from "../utils/errors";
import { truncate, uid } from "../utils/format";
import { useLocalStorage } from "./useLocalStorage";

interface UseChatArgs {
  baseUrl: string;
  model: string;
  apiKey: string;
  temperature: number;
  mode: Mode;
}

function newConversation(): Conversation {
  const now = Date.now();
  return {
    id: uid(),
    title: "New session",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function useChat({
  baseUrl,
  model,
  apiKey,
  temperature,
  mode,
}: UseChatArgs) {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>(
    STORAGE_KEYS.conversations,
    []
  );
  const [activeId, setActiveId] = useLocalStorage<string | null>(
    STORAGE_KEYS.activeConv,
    null
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const streamingRef = useRef(false);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const patchConversation = useCallback(
    (id: string, patch: (c: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === id ? patch(c) : c)));
    },
    [setConversations]
  );

  const ensureActive = useCallback((): Conversation => {
    if (active) return active;
    const fresh = newConversation();
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
    return fresh;
  }, [active, setConversations, setActiveId]);

  const startNewSession = useCallback(() => {
    const fresh = newConversation();
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
    return fresh;
  }, [setConversations, setActiveId]);

  const selectConversation = useCallback(
    (id: string) => setActiveId(id),
    [setActiveId]
  );

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [setConversations, setActiveId, activeId]
  );

  const clearAll = useCallback(() => {
    setConversations([]);
    setActiveId(null);
  }, [setConversations, setActiveId]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streamingRef.current) return;

      const conv = ensureActive();
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      const isFirstMessage = conv.messages.length === 0;

      patchConversation(conv.id, (c) => ({
        ...c,
        title: isFirstMessage ? truncate(trimmed) : c.title,
        messages: [...c.messages, userMsg, assistantMsg],
        updatedAt: Date.now(),
      }));

      const systemPrompt = BASE_SYSTEM_PROMPT + MODE_ADDENDA[mode];
      const history = [...conv.messages, userMsg].map((m) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content,
      }));

      const controller = new AbortController();
      abortRef.current = controller;
      streamingRef.current = true;
      setIsStreaming(true);

      try {
        let acc = "";
        for await (const chunk of streamChat({
          messages: [{ role: "system", content: systemPrompt }, ...history],
          baseUrl,
          model,
          apiKey,
          temperature,
          signal: controller.signal,
        })) {
          if (chunk.delta) {
            acc += chunk.delta;
            patchConversation(conv.id, (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: acc } : m
              ),
              updatedAt: Date.now(),
            }));
          }
        }

        // --- SMART TOOL DETECTION (No Regex) ---
        const firstBrace = acc.indexOf('{');
        const lastBrace = acc.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonString = acc.substring(firstBrace, lastBrace + 1);
          
          try {
            const toolData = JSON.parse(jsonString);
            
            if (toolData && toolData.tool && toolData.args) {
              // 1. Add a system status message
              const statusMsgId = uid();
              patchConversation(conv.id, (c) => ({
                ...c,
                messages: [
                  ...c.messages, 
                  { id: statusMsgId, role: "system", content: `⚙️ System: Running ${toolData.tool}...`, createdAt: Date.now() }
                ]
              }));

              // 2. Run the actual Rust command
              let toolResult = "";
              try {
                if (toolData.tool === "run_command") {
                  toolResult = await invoke("run_command", { cmd: toolData.args.cmd });
                } else if (toolData.tool === "read_file") {
                  toolResult = await invoke("read_file", { path: toolData.args.path });
                }
              } catch (err) {
                toolResult = `Error: ${err}`;
              }

              // 3. Remove status message
              patchConversation(conv.id, (c) => ({
                ...c,
                messages: c.messages.filter(m => m.id !== statusMsgId)
              }));

              // 4. Create a new message for AI's final response
              const finalMsgId = uid();
              patchConversation(conv.id, (c) => ({
                ...c,
                messages: [...c.messages, { id: finalMsgId, role: "assistant", content: "", createdAt: Date.now() }]
              }));

              // 5. Send the tool result back to AI
              let acc2 = "";
              for await (const chunk of streamChat({
                messages: [
                  { role: "system", content: systemPrompt },
                  ...history,
                  { role: "assistant", content: acc },
                  { role: "user", content: `TOOL RESULT:\n${toolResult}\n\nAb is result ka use karke user ko final answer do.` }
                ],
                baseUrl, model, apiKey, temperature, signal: controller.signal,
              })) {
                if (chunk.delta) {
                  acc2 += chunk.delta;
                  patchConversation(conv.id, (c) => ({
                    ...c,
                    messages: c.messages.map((m) => m.id === finalMsgId ? { ...m, content: acc2 } : m),
                    updatedAt: Date.now(),
                  }));
                }
              }
            }
          } catch (e) {
            // Agar JSON valid nahi hai (normal text hai), toh kuch mat karo
          }
        }

      } catch (err) {
        const msg = messageForError(err);
        patchConversation(conv.id, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: m.content || msg, isError: true }
              : m
          ),
          updatedAt: Date.now(),
        }));
      } finally {
        abortRef.current = null;
        streamingRef.current = false;
        setIsStreaming(false);
      }
    },
    [apiKey, baseUrl, mode, model, temperature, ensureActive, patchConversation]
  );

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(conversations, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cyberx-conversations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [conversations]);

  const exportMarkdown = useCallback(() => {
    if (!active) return;
    const lines: string[] = [];
    lines.push(`# ${active.title || "Untitled Session"}`);
    lines.push(`**Mode:** ${mode}`);
    lines.push(`**Exported:** ${new Date().toLocaleString()}`);
    lines.push("---");
    for (const msg of active.messages) {
      const label = msg.role === "user" ? "## 🧑 OPERATOR" : msg.isError ? "## ⚠️ SYSTEM ERROR" : "## 🤖 CYBER-X";
      lines.push(label);
      lines.push(msg.content);
      lines.push("---");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cyberx-chat-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [active, mode]);

  return {
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
  };
}
