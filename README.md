# QA Agent

A team-facing web app that acts as an AI QA advisor. Given a testing problem, the agent walks your team through a structured flow: recommend a test technique → generate test cases → recommend the best tool → optionally generate automation code. The agent's knowledge base lives in a local Obsidian vault and grows over time through a validated learning loop.

No external API keys required — uses your existing Claude Code subscription.

---

## What It Does

### 5-Step Chat Flow

1. **Intake** — Describe your testing problem. The agent asks clarifying questions about domain, tech stack, and constraints.
2. **Technique Recommendation** — The agent recommends one primary testing technique (pulled from the vault knowledge graph) with rationale.
3. **Test Cases** — Generates 4–6 concrete test cases in Given/When/Then format, downloadable as a `.md` file.
4. **Tool Recommendation** — Recommends 1–2 automation tools matched to the technique and stack, with trade-offs.
5. **Code Generation** — Generates a complete, runnable test file for the chosen tool, downloadable as source code.

The agent never advances a step without user confirmation.

### Learning Loop

Teach the agent new tools or techniques it doesn't know yet:

1. Click "Teach me something new" in the chat view
2. Enter a name and at least one usage example
3. The agent searches the web (via Claude Code's WebSearch tool) and generates a structured `.md` vault entry
4. Review and edit the draft inline before saving
5. On approval, the entry is written to the vault and the knowledge graph rebuilds immediately

### Vault Browser

Browse all knowledge base entries (tools, techniques, examples):
- Filter by domain (Web, API, Mobile, Performance) and type
- Renders each entry as formatted markdown
- Deep-links to Obsidian desktop app if installed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 6 + TypeScript 5.8 + Tailwind CSS 4 |
| Backend | Express 4 + TypeScript |
| AI — Reasoning | `@anthropic-ai/claude-agent-sdk` (uses your Claude Code subscription) |
| AI — Web Search | Claude Code's built-in WebSearch/WebFetch tools (via the SDK) |
| Knowledge Base | Local Obsidian vault (`/vault/`) — `.md` files with YAML frontmatter |
| In-memory graph | `graphology` — built from vault wikilinks at server startup |
| Frontmatter parsing | `gray-matter` |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An active **Claude Code subscription** (logged in via the `claude` CLI)
- Optionally: Obsidian desktop app for direct vault editing

### Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

No `.env.local` or API keys needed — the app uses your existing Claude Code session.

### Commands

```bash
npm run dev       # Start dev server (Express + Vite) on port 3000
npm test          # Run all tests (30 tests)
npm run lint      # TypeScript type-check
npm run build     # Production build
npm start         # Serve production build
```

---

## Project Structure

```
qa-agent/
├── server.ts                  — Express entry point + Vite middleware + download endpoint
├── api/
│   ├── chat.ts                — 5-step Claude conversation handler
│   ├── chat-routes.ts         — POST /api/chat
│   ├── learn.ts               — Learning loop: research + vault draft generation
│   ├── learn-routes.ts        — POST /api/learn, POST /api/learn/save
│   ├── vault.ts               — Vault read/write + graphology graph
│   ├── vault-routes.ts        — GET /api/vault, GET /api/vault/:slug
│   └── files.ts               — In-memory file store for generated downloads
├── src/
│   ├── App.tsx                — Top nav (Chat / Vault tabs) + ModelSelector
│   ├── types.ts               — All shared TypeScript interfaces
│   ├── data.ts                — (reserved for static content)
│   ├── views/
│   │   ├── ChatView.tsx       — 5-step conversation UI + LearnPanel toggle
│   │   └── VaultView.tsx      — Filterable vault browser
│   └── components/
│       ├── MessageThread.tsx  — Chat bubbles with ReactMarkdown
│       ├── ContextPanel.tsx   — Step progress indicator + file download pills
│       ├── LearnPanel.tsx     — 4-phase learning loop UI (form → loading → review → saved)
│       ├── VaultEntry.tsx     — Collapsible entry with domain badges + Obsidian deep-link
│       └── ModelSelector.tsx  — Sonnet / Opus model switcher
├── vault/
│   ├── techniques/            — 5 seeded entries (BVA, EP, exploratory, load, contract)
│   ├── tools/                 — 5 seeded entries (Playwright, Appium, k6, Postman, Detox)
│   └── examples/              — 2 seeded entries (Playwright login, k6 spike load)
└── tests/
    ├── api/                   — vault, vault-endpoints, files, chat, learn
    └── components/            — ModelSelector, ContextPanel, LearnPanel, VaultEntry
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/chat` | Main conversation — sends message history + step, returns agent response |
| `POST` | `/api/learn` | Learning loop — Claude researches topic and returns `.md` draft |
| `POST` | `/api/learn/save` | Saves validated `.md` to vault, rebuilds graph |
| `GET` | `/api/vault` | Returns all vault entries (metadata only) |
| `GET` | `/api/vault/:slug` | Returns full `.md` content for one entry |
| `GET` | `/api/download/:id` | Returns generated file (test cases or code) for download |
| `GET` | `/health` | Health check |

---

## Knowledge Base (Vault)

### Folder Structure

```
vault/
  techniques/   — one .md per testing technique
  tools/        — one .md per automation tool
  examples/     — code/scenario examples referenced by tools and techniques
```

### File Format

```markdown
---
type: tool
name: Playwright
domains: [web, api]
language: [typescript, python, java]
tags: [e2e, cross-browser, headless]
---

Description of the tool.

## Strengths
- ...

## When to use
...

## Related techniques/tools
[[E2E Testing]] · [[API Testing]]

## Examples
[[playwright-login-test]]
```

### Seeded Entries (12 total)

**Techniques:** Boundary Value Analysis, Equivalence Partitioning, Exploratory Testing, Load Testing, Contract Testing

**Tools:** Playwright, Appium, k6, Postman, Detox

**Examples:** Playwright Login Test, k6 Spike Load

The graph has 25 directed edges connecting techniques to tools to examples via `[[wikilinks]]`.

---

## Domains Covered

- **Web** — browser-based end-to-end testing
- **API** — REST, GraphQL, contract testing
- **Mobile** — iOS, Android, cross-platform
- **Performance** — load, stress, spike testing

---

## Security

- Vault slug validation on read and write: `/^[a-z0-9-]+$/` regex prevents path traversal
- Type validation on learning loop save: only `tool`, `technique`, `example` accepted
- No authentication (internal team tool by design)

---

## What Was Built

This project was implemented across 12 tasks + 1 refactor in a single session using subagent-driven development:

| # | Commit | What |
|---|---|---|
| 1 | `2a4ad68` | Project scaffold — Express + Vite + TypeScript + ESM config |
| 2 | `a7de2b3` | Shared TypeScript types (`src/types.ts`) |
| 3 | `333bb1c` | Vault infrastructure — parse, graph build, read/write |
| 4 | `22a055c` | 12 seeded vault entries with 25 graph edges |
| 5 | `30edd24` | Vault API endpoints |
| 6 | `eceaaae` | In-memory file store + download endpoint |
| 7 | `02a1748` | Claude chat API — 5-step system prompts, file generation |
| 8 | `f30b8f4` | Learning loop API — research, draft generation, vault save |
| 9 | `597dcb9` | Frontend scaffold — App shell, nav, ModelSelector |
| 10 | `2058ce3` | Chat view — full 5-step conversation UI |
| 11 | `8d86e2d` | Vault view — filterable browser with Obsidian deep-links |
| 12 | `ce96b17` | Learning loop UI — 4-phase form/loading/review/saved |
| — | `18a22a5` | Security fixes: res.ok guards, slug validation, graph guards |
| — | `5d2fbed` | Refactor: replaced Anthropic API + Gemini API with Claude Code SDK |
