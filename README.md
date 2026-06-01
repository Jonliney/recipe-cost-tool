# Recipe Cost Tool

Next.js and `shadcn/ui` are scaffolded for the app shell.

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

## Auth And Database

Core wiring now includes:

- Better Auth with email/password and the organization plugin
- Neon serverless driver with Drizzle ORM
- generated Better Auth Drizzle schema and initial SQL migration

Useful scripts:

```bash
npm run auth:generate
npm run db:generate
npm run db:migrate
npm run db:studio
```

## Planning Docs

- `docs/implementation-plan.md`
- `docs/architecture.md`
- `docs/adr/0001-nextjs-app-monolith.md`
- `docs/adr/0002-org-scoped-versioned-domain.md`
- `docs/adr/0003-milestone-1-scope.md`
- `docs/adr/0004-shared-costing-engine.md`
