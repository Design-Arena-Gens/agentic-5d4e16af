# Atlas Agent Workspace

This repository houses **Atlas**, a web-native AI agent engineered to translate ambiguous goals into crisp execution plans. The production-ready Next.js application lives in `./web` and is optimised for Vercel deployments.

## Repository Layout

```
.
├── web/             # Next.js (App Router) application
│   ├── src/app      # Atlas UI + API routes
│   ├── src/lib      # Agent reasoning + tool stack
│   └── README.md    # Project-level usage notes
└── README.old       # (This file) high-level workspace guide
```

## Quick Start

```bash
cd web
npm install
npm run dev
```

Visit `http://localhost:3000` to collaborate with the agent. Paste your notes, ideas, or raw instructions—Atlas will respond with plans, tool traces, and follow-up suggestions.

## Deployment

Deploy the preconfigured Vercel production target straight from the workspace root:

```bash
cd web
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-5d4e16af
```

After a few seconds, verify the deployment:

```bash
curl https://agentic-5d4e16af.vercel.app
```

If you need an OpenAI-backed experience, set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) in the Vercel project settings. Without it, Atlas falls back to deterministic local tooling so the UX remains interactive.

## Support

Reach out if you encounter issues or want to extend the agent with new tools, automations, or integrations. The modular `src/lib/agent` helpers are designed for quick iteration.
