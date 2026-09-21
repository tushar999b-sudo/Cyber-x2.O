import { classifyHttpStatus, LLMError } from "../utils/errors";

export interface ChatMessagePayload {
  role: "system" | "user" | "assistant";
  content: string;
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
  } catch {
    return undefined;
  }
}

export async function* streamChat(
  req: StreamChatRequest
): AsyncGenerator<StreamChunk> {
  if (!req.apiKey) {
    throw new LLMError("MISSING_KEY");
  }

  let res: Response;
  try {
    res = await fetch(`${req.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${req.apiKey}`,
      },
      body: JSON.stringify({
        model: req.model,
        messages: req.messages,
        temperature: req.temperature,
        stream: true,
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

  if (!res.body) {
    throw new LLMError("UNKNOWN", "Empty response body.");
  }

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
        if (payload === "[DONE]") {
          yield { delta: "", done: true };
          return;
        }
        try {
          const json = JSON.parse(payload);
          const delta: string | undefined = json?.choices?.[0]?.delta?.content;
          if (delta) yield { delta, done: false };
        } catch {
          // Skip malformed SSE fragments rather than fail the whole stream.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  yield { delta: "", done: true };
}

export interface TestConnectionResult {
  ok: boolean;
  error?: string;
  model?: string;
}

export async function testConnection(req: {
  baseUrl: string;
  model: string;
  apiKey: string;
}): Promise<TestConnectionResult> {
  if (!req.apiKey) {
    return { ok: false, error: "No API key entered." };
  }
  try {
    const res = await fetch(`${req.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${req.apiKey}`,
      },
      body: JSON.stringify({
        model: req.model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
        stream: false,
      }),
    });

    if (!res.ok) {
      const detail = await parseErrorBody(res);
      return {
        ok: false,
        error: detail ?? `Request failed with status ${res.status}.`,
      };
    }

    const data = await res.json();
    return { ok: true, model: data?.model ?? req.model };
  } catch {
    return {
      ok: false,
      error: "Network error — could not reach the API.",
    };
  }
}