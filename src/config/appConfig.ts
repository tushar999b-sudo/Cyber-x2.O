import type { Mode, ProviderConfig } from "../types/settings";

export const APP_VERSION = "2.0.0";
export const APP_NAME = "CYBER-X 2.0";
export const APP_SUBTITLE = "SECURITY OPERATIONS TERMINAL";

export const PROVIDERS: Record<string, ProviderConfig> = {
  groq: {
    id: "groq",
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "openai/gpt-oss-120b",
    models: ["openai/gpt-oss-120b", "llama-3.3-70b-versatile", "custom"],
    keyLabel: "GROQ API KEY",
    keyPlaceholder: "gsk_...",
  },
  openai: {
    id: "openai",
    label: "OpenAI (ChatGPT)",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "custom"],
    keyLabel: "OPENAI API KEY",
    keyPlaceholder: "sk-...",
  },
  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    models: ["deepseek-chat", "deepseek-reasoner", "custom"],
    keyLabel: "DEEPSEEK API KEY",
    keyPlaceholder: "sk-...",
  },
};

export const STORAGE_KEYS = {
  settings: "cyberx.settings.v2",
  conversations: "cyberx.conversations.v2",
  apiKey: "cyberx.apiKey.v2",
  mode: "cyberx.mode.v2",
  activeConv: "cyberx.activeConv.v2",
} as const;

export const BASE_SYSTEM_PROMPT =
  "You are CYBER-X 2.0, a technical assistant for a professional security engineer working exclusively on systems they own or have explicit written authorization to assess. You assist with: reading and writing code in Python, Bash, C, Go, and JavaScript; system administration; network troubleshooting; log analysis; configuration review; secure code review; documentation; and general software engineering. Format responses in clean Markdown with fenced, language-tagged code blocks. Be precise, technical, and concise. Ask for clarification if scope is unclear.";

export const MODE_ADDENDA: Record<Mode, string> = {
  PENTEST:
    "\n\nMode: ASSESSMENT — focus on reconnaissance planning, scope documentation, and structured assessment workflows.",
  CODE: "\n\nMode: CODE — act as a senior software engineer. Ship complete, runnable files with imports, error handling, and a usage block.",
  IOT: "\n\nMode: IOT — embedded and IoT focus: firmware review, serial debugging, MQTT/CoAP, BLE, and hardware inspection concepts.",
  DEFENSE:
    "\n\nMode: DEFENSE — blue team. Prioritize detection rules, log queries, hardening, and remediation steps.",
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

export const EXAMPLE_PROMPTS = [
  "Review this Python script for security issues",
  "Write a Python network utility with service detection",
  "Explain this CVE and give a remediation plan",
  "Generate a network assessment workflow for my authorized scope",
  "Review this IoT firmware update logic for vulnerabilities",
];