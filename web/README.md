## Atlas Agent

Atlas is an execution-focused AI agent designed to live inside a modern web workflow. It can break ambiguous goals into structured plans, run lightweight tools (planner, summariser, calculator, curated knowledge base), and optionally call OpenAI when an `OPENAI_API_KEY` is provided.

### Features

- Conversational UI with stateful session memory.
- Dynamic action timeline that explains each tool the agent executed.
- Curated playbook knowledge base with inline citations.
- Local heuristics fallback when no external LLM key is present.
- Ready for Vercel Edge deployment (`/api/agent` runs on the edge runtime).

### Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and drop a goal, notes, or transcript into the composer.

### Environment Variables

- `OPENAI_API_KEY` (optional): unlocks higher-quality reasoning via OpenAI's Chat Completions API.
- `OPENAI_MODEL` (optional): defaults to `gpt-4o-mini`.

Without credentials, Atlas falls back to deterministic local tools so you can demo the experience.

### Production Build

```bash
npm run build
npm run start
```

### Deploying to Vercel

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-5d4e16af
```

Ensure `VERCEL_TOKEN` is available in the shell session (pre-configured in the provided environment).
