import type { Mode, ProviderConfig } from "../types/settings";
import { CLAUDE_STYLE_SYSTEM_PROMPT } from "./systemPrompt";

export const APP_VERSION = "2.0.0";
export const APP_NAME = "CYBER-X 2.0";
export const APP_SUBTITLE = "SECURITY OPERATIONS TERMINAL";

export const PROVIDERS: Record<string, ProviderConfig> = {
  local: {
    id: "local",
    label: "Local Router (FreeLLMAPI)",
    baseUrl: "http://127.0.0.1:31415/v1", // Dashboard wala URL
    defaultModel: "gpt-4o", 
    models: [
      "gpt-4o", 
      "llama-3.3-70b-versatile",
      "custom"
    ],
    keyLabel: "LOCAL GATEWAY KEY",
    keyPlaceholder: "freellmapi-...",
  },
  groq: {
    id: "groq",
    label: "Groq (Fast & Free)",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "openai/gpt-oss-20b",
    models: ["openai/gpt-oss-20b", "openai/gpt-oss-120b", "custom"],
    keyLabel: "GROQ API KEY",
    keyPlaceholder: "gsk_...",
  },
};

export const STORAGE_KEYS = {
  settings: "cyberx.settings.v2",
  conversations: "cyberx.conversations.v2",
  apiKey: "cyberx.apiKey.v2",
  mode: "cyberx.mode.v2",
  activeConv: "cyberx.activeConv.v2",
  memory: "cyberx.memory.v1",
} as const;

export const BASE_SYSTEM_PROMPT = CLAUDE_STYLE_SYSTEM_PROMPT;

export const MODE_ADDENDA: Record<Mode, string> = {
  PENTEST: "\n\nMode: PENTEST — focus on security and recon.",
  CODE: "\n\nMode: CODE — act as a senior software engineer.",
  IOT: "\n\nMode: IOT — embedded and IoT focus.",
  DEFENSE: "\n\nMode: DEFENSE — blue team and hardening.",
};

export const ERROR_MESSAGES = {
  MISSING_KEY: "No API key configured. Open Settings and add your key.",
  INVALID_KEY: "Invalid API key (401). Check your key in Settings.",
  RATE_LIMIT: "Rate limited (429). Wait a moment or switch models.",
  MODEL_DOWN: "Model unavailable. Try a different model in Settings.",
  NETWORK: "Network error. Check your connection.",
  ABORTED: "Generation stopped.",
  UNKNOWN: "Unexpected error. See console for details.",
} as const;
