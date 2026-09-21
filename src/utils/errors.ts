import { ERROR_MESSAGES } from "../config/appConfig";

export type ErrorCode =
  | "MISSING_KEY"
  | "INVALID_KEY"
  | "RATE_LIMIT"
  | "MODEL_DOWN"
  | "NETWORK"
  | "ABORTED"
  | "UNKNOWN";

export class LLMError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message?: string) {
    super(message ?? ERROR_MESSAGES[code]);
    this.code = code;
    this.name = "LLMError";
  }
}

export function classifyHttpStatus(status: number): ErrorCode {
  if (status === 401 || status === 403) return "INVALID_KEY";
  if (status === 429) return "RATE_LIMIT";
  if (status === 400 || status === 404) return "MODEL_DOWN";
  return "UNKNOWN";
}

export function messageForError(err: unknown): string {
  if (err instanceof LLMError) return err.message;
  if (err instanceof DOMException && err.name === "AbortError") {
    return ERROR_MESSAGES.ABORTED;
  }
  if (err instanceof TypeError) {
    return ERROR_MESSAGES.NETWORK;
  }
  if (err instanceof Error) return err.message;
  return ERROR_MESSAGES.UNKNOWN;
}