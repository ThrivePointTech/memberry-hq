# Memberry HQ — Agent Instructions

@AGENTS.md

## Platform Map

Memberry is a loyalty/subscription platform. All five repositories work together:

| Repo | Stack | Role |
|------|-------|------|
| `memberry-api` | Hono + Node.js + TypeScript + Knex + PostgreSQL | REST API backend |
| `memberry-hq` | Next.js 16 + React 19 + Tailwind | Internal merchant dashboard ← **this repo** |
| `memberry-merchant` | Flutter (Dart) | Merchant mobile app (iOS + Android) |
| `memberry-subscriber` | Next.js 16 + React 19 + Tailwind | Subscriber-facing web app |
| `memberry-steering` | OpenSpec | Cross-project change coordination |

## Stack & Structure

- Next.js 16 App Router, internal-only (no public-facing routes)
- UI: shadcn components (`components.json`), Base UI (`@base-ui/react`), Tailwind v4, Recharts for charts
- Routes: `src/app/(dashboard)/` (protected), `src/app/login/`
- `src/proxy.ts` — API proxy layer to `memberry-api`
- Run: `npm run dev` · Lint: `npm run lint`
