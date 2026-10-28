import { classifyHttpStatus, LLMError } from "../utils/errors";
import { fetch } from "@tauri-apps/plugin-http"; 

export type ContentPart = 
  | { type: "text"; text: string } 
  | { type: "image_url"; image_url: { url: string } };

export interface ChatMessagePayload {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[]; 
}

export interface StreamChatRequest {
  messages: ChatMessagePayload[];
  baseUrl: string;
  model: string;
  apiKey: string;
  temperature: number;
  signal?: AbortSignal;
}

export interface StreamChunk {
  delta: string;
  done: boolean;
}

async function parseErrorBody(res: Response): Promise<string | undefined> {
  try {
    const data = await res.json();
    return data?.error?.message ?? data?.message;
  } catch { return undefined; }
}

export async function* streamChat(req: StreamChatRequest): AsyncGenerator<StreamChunk> {
  const isOllama = req.baseUrl.includes("11434");
  if (!req.apiKey && !isOllama) throw new LLMError("MISSING_KEY");
  
  let res: Response;
  try {
    res = await fetch(`${req.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${req.apiKey || "ollama"}`, 
        "HTTP-Referer": "https://cyber-x.app", 
        "X-Title": "CYBER-X 2.0" 
      },
      body: JSON.stringify({ 
        model: req.model, 
        messages: req.messages, 
        temperature: req.temperature, 
        stream: true, 
        max_tokens: 2048 
      }),
      signal: req.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new LLMError("NETWORK");
  }

  if (!res.ok) {
    const code = classifyHttpStatus(res.status);
    const detail = await parseErrorBody(res);
    throw new LLMError(code, detail);
  }

  if (!res.body) throw new LLMError("UNKNOWN", "Empty response body.");
  
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        
        if (payload === "[DONE]") { yield { delta: "", done: true }; return; }
        
        try {
          const json = JSON.parse(payload);
          const delta: string | undefined = json?.choices?.[0]?.delta?.content;
          if (delta) yield { delta, done: false };
        } catch {}
      }
    }
  } finally { 
    reader.releaseLock(); 
  }
  
  yield { delta: "", done: true };
}
