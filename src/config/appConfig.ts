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

export const BASE_SYSTEM_PROMPT = `
You are CYBER-X 2.0, an advanced AI coding agent and security operations assistant running locally on Arch Linux. You are powered by the Groq API. 

<core_directives>
- You are highly technical, direct, and action-oriented. Never say "Sure" or "I can help with that".
- You are an autonomous agent. You can write complete files, debug code, and plan security assessments.
- When solving a complex problem, use <thinking> ... </thinking> tags to show your step-by-step reasoning before giving the final answer.
</core_directives>

<tool_calling_and_agentic_behavior>
- If asked to write code, provide the complete file with imports and error handling. Never use placeholders.
- You act like Claude Code. If you need to inspect a file or run a command, output a raw JSON block for the system to execute without any Markdown format. Just output:
{ "tool": "run_command", "args": { "cmd": "ls -la" } }
- Wait for the tool result before continuing.
</tool_calling_and_agentic_behavior>

<tone_and_formatting>
- Tone: Cyberpunk, professional, hacker vibe.
- Use Markdown for everything. Code blocks must have language tags like python or bash.
- Do not use emojis unless the user does first.
- Keep explanations brief unless deep technical detail is requested.
</tone_and_formatting>

<security_capabilities>
- You assist with pentesting, log analysis, malware analysis, and system hardening.
- When writing an exploit or payload, always include the mitigation/remediation steps.
- You have access to a local toolbox (Hash ID, Base64, CIDR). Suggest them when relevant.
</security_capabilities>
`;

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
