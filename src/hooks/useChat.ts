import { useCallback, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { BASE_SYSTEM_PROMPT, MODE_ADDENDA, STORAGE_KEYS } from "../config/appConfig";
import { streamChat } from "../services/llmService";
import type { ChatMessage, Conversation } from "../types/chat";
import type { Mode } from "../types/settings";
import { messageForError } from "../utils/errors";
import { truncate, uid } from "../utils/format";
import { useLocalStorage } from "./useLocalStorage";
import { useMemory } from "./useMemory";

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

  const memory = useMemory();
  const { asPromptContext } = memory;

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
    // 🟢 NAYA: Accepts image parameter
    async (text: string, image?: string) => {
      const trimmed = text.trim();
      if ((!trimmed && !image) || streamingRef.current) return;

      const conv = ensureActive();
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
        image: image, // 🟢 Save image
      };
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      const isFirstMessage = conv.messages.length === 0;
      const titleText = trimmed || "Image Upload";

      patchConversation(conv.id, (c) => ({
        ...c,
        title: isFirstMessage ? truncate(titleText) : c.title,
        messages: [...c.messages, userMsg, assistantMsg],
        updatedAt: Date.now(),
      }));

      const memoryContext = asPromptContext();
      const systemPrompt = BASE_SYSTEM_PROMPT + MODE_ADDENDA[mode] + memoryContext;
      
      // 🟢 Format history for Vision Models
      let currentHistory = [...conv.messages, userMsg].slice(-6).map((m) => {
        if (m.image) {
          return {
            role: m.role as any,
            content: [
              { type: "text", text: m.content || "What is in this image?" },
              { type: "image_url", image_url: { url: m.image } }
            ]
          };
        }
        return { role: m.role as any, content: m.content };
      });

      const controller = new AbortController();
      abortRef.current = controller;
      streamingRef.current = true;
      setIsStreaming(true);

      try {
        let loopCount = 0;
        let isDone = false;
        let lastToolCall = "";

        while (!isDone && loopCount < 5) {
          loopCount++;
          let acc = "";

          for await (const chunk of streamChat({
            messages: [{ role: "system", content: systemPrompt }, ...currentHistory],
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

          // 🛡️ SMART PARSER (Checks for JSON)
          const toolMatch = acc.match(/\{\s*"(?:tool|name)"\s*:/);
          let hasToolCall = false;

          if (toolMatch && toolMatch.index !== undefined) {
            const jsonStart = toolMatch.index;
            const lastBrace = acc.lastIndexOf("}");
            
            if (lastBrace > jsonStart) {
              let jsonString = acc.substring(jsonStart, lastBrace + 1).trim();
              jsonString = jsonString.replace(/```json/gi, "").replace(/```/g, "").trim();
              
              try {
                const toolData = JSON.parse(jsonString);
                const toolName = toolData.tool || toolData.name;
                const toolArgs = toolData.args || toolData.parameters;

                if (toolName && toolArgs) {
                  hasToolCall = true;
                  const currentToolStr = JSON.stringify(toolData);

                  if (currentToolStr === lastToolCall) {
                    isDone = true;
                    patchConversation(conv.id, (c) => ({
                      ...c,
                      messages: c.messages.map(m => m.id === assistantMsg.id ? { ...m, content: "⚠️ Stopped infinite loop." } : m)
                    }));
                    break;
                  }
                  lastToolCall = currentToolStr;

                  patchConversation(conv.id, (c) => ({
                    ...c,
                    messages: c.messages.map(m => m.id === assistantMsg.id ? { ...m, content: "" } : m)
                  }));

                  const systemMsgId = uid();
                  patchConversation(conv.id, (c) => ({
                    ...c,
                    messages: [...c.messages, { 
                      id: systemMsgId, 
                      role: "system", 
                      content: `⚙️ EXECUTING: ${toolName}\n\n${toolArgs.cmd || toolArgs.path || ''}`, 
                      createdAt: Date.now() 
                    } as any]
                  }));

                  let toolResult = "";
                  try {
                    if (toolName === "run_command") toolResult = await invoke("run_command", { cmd: toolArgs.cmd });
                    else if (toolName === "read_file") toolResult = await invoke("read_file", { path: toolArgs.path });
                    else if (toolName === "write_file") toolResult = await invoke("write_file", { path: toolArgs.path, content: toolArgs.content });
                  } catch (err) { toolResult = `Error: ${err}`; }

                  patchConversation(conv.id, (c) => ({
                    ...c,
                    messages: c.messages.map(m => m.id === systemMsgId ? { 
                      ...m, 
                      content: `⚙️ EXECUTED: ${toolName}\n\n${toolResult.slice(0, 1000)}` 
                    } : m)
                  }));

                  currentHistory.push({ role: "assistant", content: acc });
                  currentHistory.push({ role: "user", content: `TOOL RESULT:\n${toolResult}\n\nAb agla step karo ya final answer do.` });
                  
                  patchConversation(conv.id, (c) => ({
                    ...c,
                    messages: c.messages.map(m => m.id === assistantMsg.id ? { ...m, content: "" } : m)
                  }));
                }
              } catch (e) {
                console.error("JSON Parse Error:", e);
              }
            }
          }

          if (!hasToolCall) {
            isDone = true;
          }
        }
      } catch (err: any) {
        let msg = messageForError(err);
        if (err.message && err.message.includes("upstream provider errors")) {
           msg = "⚠️ Gateway Error: The selected model timed out or is unavailable.";
        }
        patchConversation(conv.id, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: m.content || msg, isError: true } : m
          ),
          updatedAt: Date.now(),
        }));
      } finally {
        abortRef.current = null;
        streamingRef.current = false;
        setIsStreaming(false);
      }
    },
    [apiKey, baseUrl, mode, model, temperature, ensureActive, patchConversation, asPromptContext]
  );

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
    memory,
  };
}
