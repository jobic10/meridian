# Meridian

An integrated electronic patient health record platform — a working
prototype built from the *"Development of an Integrated Electronic Patient
Health Record Management Platform for Efficient Health Care Information
Management"* final year project brief.

Where the original brief specifies a PHP/MySQL/XAMPP stack, this
implementation uses a modern equivalent chosen for correctness and easy
hosting (see [Architecture](#architecture) and [Hosting](#hosting) below)
while covering the same functional requirements: patient registration,
medical records, appointment scheduling, prescriptions, laboratory results,
role-based access control, and administrative reporting.

## Quick start

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db and applies the schema
npx prisma db seed       # seeds demo staff accounts and sample patients
npm run dev
```

Visit `http://localhost:3000`. Sign in with any seeded account — password is
`meridian123` for all of them:

| Username      | Role                        |
|---------------|-----------------------------|
| `admin`       | Administrator               |
| `dr.adeyemi`  | Doctor (General Medicine)   |
| `dr.chukwu`   | Doctor (Paediatrics)        |
| `n.okafor`    | Nurse                       |
| `records`     | Records Officer             |
| `pharm.bello` | Pharmacist                  |

## Architecture

- **Next.js 16** (App Router, Turbopack, React 19) — server components for
  data fetching, server actions for mutations, no separate REST/GraphQL
  layer to maintain.
- **Prisma 7 + SQLite** in development (`prisma/dev.db`), trivially swapped
  to Postgres for production by changing the datasource provider and
  `DATABASE_URL` — see [Hosting](#hosting).
- **Auth**: hand-rolled session cookie (HS256 JWT via `jose`), `bcryptjs`
  password hashing, `proxy.ts` for the coarse "are you logged in" redirect
  and a per-request Data Access Layer (`src/lib/session.ts`,
  `src/lib/auth.ts`) that re-verifies the user and role on every request —
  see the code comments for why both layers exist.
- **UI**: Tailwind CSS v4 + Radix UI primitives, hand-styled (not a stock
  shadcn theme) around a warm "clinical archive" palette — deep teal,
  warm paper, a serif/sans display pairing (Fraunces + Inter).
- **RBAC**: five roles (Administrator, Doctor, Nurse, Records Officer,
  Pharmacist), enforced in `src/lib/rbac.ts` (nav visibility) and
  `requireRole()` (actual access control, checked again inside every server
  action — never trust the client for this).

## Project structure

```
src/app/(app)/          protected pages, wrapped in the sidebar shell
src/app/actions/        server actions (mutations) — one file per domain
src/components/         UI, grouped by feature
src/lib/                 auth, session, prisma client, formatting, RBAC
prisma/schema.prisma     data model
prisma/seed.ts           demo data generator
```

## Scope notes

Matching the original brief's stated limitations: this is a prototype for a
single hospital, staff-only (no patient-facing portal), and does not include
billing, insurance, or inventory modules — all explicitly called out as
future work in the source document.

## Hosting

Recommended: **Vercel** for the app itself, with the database swapped from
SQLite to a managed Postgres instance (Neon, Vercel Postgres, Supabase, or
Railway all work well). SQLite is dev-only here — it's a single file on
disk, which doesn't survive Vercel's ephemeral serverless filesystem.

To switch datasources: change `provider = "sqlite"` to `"postgresql"` in
`prisma/schema.prisma`, point `DATABASE_URL` at the Postgres instance, swap
the `@prisma/adapter-better-sqlite3` adapter in `src/lib/prisma.ts` and
`prisma/seed.ts` for `@prisma/adapter-pg` (or drop the adapter entirely and
let Prisma use its default Postgres driver), then run
`npx prisma migrate deploy`.

Railway is a solid alternative if you'd rather keep the app and database on
one platform instead of splitting Vercel + a DB provider.
