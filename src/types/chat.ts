export type Role = "system" | "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}