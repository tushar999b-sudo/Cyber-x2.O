import { useCallback } from "react";

export interface MemoryEntry {
  id: string;
  text: string;
  tags: string[];
  createdAt: number;
}

interface MemoryStore {
  facts: MemoryEntry[];
  chatLink: any | null;
}

const MEMORY_KEY = "cyberx.memory.v1";
const MAX_FACTS = 100;

function safeRead(): MemoryStore {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return { facts: [], chatLink: null };
    const parsed = JSON.parse(raw);
    return {
      facts: Array.isArray(parsed?.facts) ? parsed.facts : [],
      chatLink: parsed?.chatLink ?? null,
    };
  } catch (e) {
    return { facts: [], chatLink: null };
  }
}

function safeWrite(store: MemoryStore) {
  try {
    const trimmedFacts = store.facts.length > MAX_FACTS ? store.facts.slice(-MAX_FACTS) : store.facts;
    localStorage.setItem(MEMORY_KEY, JSON.stringify({ facts: trimmedFacts, chatLink: store.chatLink }));
  } catch (e) {}
}

export function useMemory() {
  const getAllFacts = useCallback((): MemoryEntry[] => safeRead().facts, []);

  const addFact = useCallback((text: string, tags: string[] = []): MemoryEntry => {
    const entry: MemoryEntry = {
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text: text.trim(),
      tags,
      createdAt: Date.now(),
    };
    const store = safeRead();
    const exists = store.facts.some((m) => m.text.toLowerCase() === entry.text.toLowerCase());
    if (exists) return entry;
    store.facts.push(entry);
    safeWrite(store);
    return entry;
  }, []);

  const removeFact = useCallback((id: string) => {
    const store = safeRead();
    store.facts = store.facts.filter((m) => m.id !== id);
    safeWrite(store);
  }, []);

  const asPromptContext = useCallback((): string => {
    const store = safeRead();
    let out = "";

    if (store.facts.length) {
      const lines = store.facts.map((m, i) => `${i + 1}. ${m.text}`).join("\n");
      out += `\n\nLONG-TERM MEMORY (facts you remember):\n${lines}\n`;
    }
    return out;
  }, []);

  return { getAllFacts, addFact, removeFact, asPromptContext };
}
