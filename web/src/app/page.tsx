"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Bolt,
  Brain,
  Circle,
  Compass,
  History,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { AgentTurn, ChatMessage } from "@/types/agent";

type ConversationMessage = ChatMessage & {
  turn?: AgentTurn;
};

const defaultSuggestions = [
  "Design a sprint plan for a new AI feature launch.",
  "Summarise this meeting transcript into action items.",
  "Brainstorm positioning angles for a product pivot.",
  "Draft an onboarding flow for power users in week one.",
];

const initialAssistantMessage: ConversationMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "I'm Atlas, your execution-first AI operator. Drop me a goal or messy notes—I’ll map the path, surface blockers, and keep you moving.",
  turn: {
    reply: "",
    actions: [
      {
        title: "Onboarding",
        description: "Set expectations for how I collaborate.",
        outcome:
          "Clarify the target outcome • Gather key constraints • Translate into a tight plan • Keep the loop tight with next actions.",
      },
    ],
    sources: [],
    suggestions: defaultSuggestions,
    meta: { usedOpenAI: false },
  },
};

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const composeMessage = (content: string): ConversationMessage => ({
  id: generateId(),
  role: "user",
  content,
});

const scrollToBottom = (node: HTMLDivElement | null) => {
  if (node) {
    node.scrollTo({
      top: node.scrollHeight,
      behavior: "smooth",
    });
  }
};

export default function Home() {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    initialAssistantMessage,
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollToBottom(containerRef.current);
  }, [messages.length, loading]);

  const currentSuggestions = useMemo(() => {
    const lastTurn = [...messages]
      .reverse()
      .find((message) => message.turn?.suggestions?.length);
    return lastTurn?.turn?.suggestions ?? defaultSuggestions;
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || loading) return;

      setLoading(true);
      setError(null);

      const userMessage = composeMessage(content.trim());
      const conversation = [...messages, userMessage];
      setMessages(conversation);
      setInput("");

      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: conversation.map(({ role, content: body }) => ({
              role,
              content: body,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        const data = (await response.json()) as {
          status: string;
          result?: AgentTurn;
          error?: string;
        };

        if (data.status !== "ok" || !data.result) {
          throw new Error(data.error ?? "Agent returned no result");
        }

        const assistantMessage: ConversationMessage = {
          id: generateId(),
          role: "assistant",
          content: data.result.reply,
          turn: data.result,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while running the agent.",
        );
      } finally {
        setLoading(false);
      }
    },
    [messages, loading],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void sendMessage(input);
    },
    [input, sendMessage],
  );

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      setInput(suggestion);
      void sendMessage(suggestion);
    },
    [sendMessage],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Compass size={16} className="text-emerald-400" />
              <span>Atlas Agent</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/50 px-2 py-0.5 text-xs font-medium text-emerald-300">
                <Circle size={8} className="fill-emerald-400 text-emerald-400" />
                live
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-white">
              Turn ambiguous goals into crisp execution
            </h1>
          </div>
          <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-400 md:flex">
            <History size={14} />
            <span>Stateful memory per session</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <div
          ref={containerRef}
          className="flex-1 space-y-6 overflow-y-auto rounded-3xl border border-slate-900 bg-slate-950/40 p-6 shadow-inner"
        >
          {messages.map((message) => (
            <article
              key={message.id}
              className={`flex flex-col gap-3 rounded-2xl border border-transparent px-4 py-3 ${
                message.role === "assistant"
                  ? "bg-slate-900/60"
                  : "self-end bg-emerald-500/10 text-emerald-100"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {message.role === "assistant" ? (
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <Sparkles size={12} />
                    Atlas
                  </span>
                ) : (
                  <span className="text-slate-500">You</span>
                )}
                {message.role === "assistant" && message.turn?.meta?.usedOpenAI ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    <Bolt size={10} />
                    OpenAI
                    {typeof message.turn.meta.latencyMs === "number" && (
                      <span className="text-emerald-200/70">
                        {message.turn.meta.latencyMs}ms
                      </span>
                    )}
                  </span>
                ) : null}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                {message.content}
              </p>

              {message.turn?.actions?.length ? (
                <div className="space-y-3 rounded-xl border border-slate-900/40 bg-slate-900/30 p-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <Brain size={12} />
                    Agent Moves
                  </div>
                  <div className="space-y-2">
                    {message.turn.actions.map((action, index) => (
                      <div
                        key={`${action.title}-${index}`}
                        className="rounded-lg border border-slate-900/60 bg-slate-950/50 p-3"
                      >
                        <div className="text-xs font-semibold text-slate-200">
                          {action.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {action.description}
                        </div>
                        <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-300">
                          {action.outcome}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {message.turn?.sources?.length ? (
                <div className="space-y-3 rounded-xl border border-slate-900/40 bg-slate-900/30 p-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <Compass size={12} />
                    Referenced Playbooks
                  </div>
                  <div className="space-y-2">
                    {message.turn.sources.map((source, index) => (
                      <div
                        key={`${source.title}-${index}`}
                        className="rounded-lg border border-slate-900/60 bg-slate-950/50 p-3"
                      >
                        <div className="text-xs font-semibold text-emerald-300">
                          {source.url ? (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline"
                            >
                              {source.title}
                            </a>
                          ) : (
                            source.title
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {source.excerpt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          ))}

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
              Atlas is mapping the next steps...
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <section className="mt-4 flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {currentSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestion(suggestion)}
                className="group rounded-2xl border border-slate-900 bg-slate-950/60 px-4 py-3 text-left text-sm text-slate-300 transition hover:border-emerald-500/60 hover:bg-slate-900/60 hover:text-emerald-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <span>{suggestion}</span>
                  <Sparkles className="mt-1 h-4 w-4 text-emerald-300 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-3 rounded-3xl border border-slate-900 bg-slate-950/80 p-4 shadow-lg ring-1 ring-slate-800/60"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for a launch plan, break down a goal, or paste raw notes…"
              rows={input.split("\n").length > 2 ? 4 : 2}
              className="w-full resize-none bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
