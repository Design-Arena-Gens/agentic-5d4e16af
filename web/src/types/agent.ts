export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id?: string;
  role: ChatRole;
  content: string;
  createdAt?: string;
}

export interface AgentAction {
  title: string;
  description: string;
  outcome: string;
}

export interface AgentSource {
  title: string;
  url?: string;
  excerpt: string;
}

export interface AgentTurn {
  reply: string;
  actions: AgentAction[];
  sources: AgentSource[];
  suggestions: string[];
  meta?: {
    usedOpenAI: boolean;
    latencyMs?: number;
  };
}
