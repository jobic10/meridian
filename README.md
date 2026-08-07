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

This is a **two-service app**: this repo is the Next.js frontend; the
backend lives alongside it in [`../meridian-api`](../meridian-api) as a
Django REST Framework project. Both need to be running for the app to work.

## Quick start

```bash
# 1. Backend — from ../meridian-api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 8811

# 2. Frontend — from this directory, in a second terminal
npm install
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

- **Next.js 16** (App Router, Turbopack, React 19) as the frontend/BFF —
  Server Components fetch from the Django API, Server Actions POST/PATCH to
  it. There's no database client in this repo at all; `src/lib/api.ts` is
  the only thing that talks to the backend.
- **Django REST Framework** (`../meridian-api`) owns the data model, auth,
  and every authorization decision. It's a *private* API — reachable only
  from this Next.js server, never from a browser — so it carries no public
  CORS/CSRF surface.
- **Auth**: Django issues a JWT (`djangorestframework-simplejwt`) on login;
  Next.js stores only the access token, in an httpOnly cookie (8h lifetime,
  no refresh flow — a shift-length session, by design). `proxy.ts` does a
  coarse "is there a token, and does it look unexpired" check to avoid
  redirect loops; `src/lib/session.ts` calls Django's `/api/auth/me/` on
  every request for the actual answer, since that's the only place a
  revoked or expired token is authoritatively rejected.
- **UI**: Tailwind CSS v4 + Radix UI primitives, hand-styled (not a stock
  shadcn theme) around a warm "clinical archive" palette — deep teal, warm
  paper, a serif/sans display pairing (Fraunces + Inter).
- **RBAC**: five roles (Administrator, Doctor, Nurse, Records Officer,
  Pharmacist). `src/lib/rbac.ts` drives nav visibility (UX only); the real
  enforcement is server-side in Django's `role_required()` permission
  classes, re-checked on every single API call.

## Project structure

```
src/app/(app)/          protected pages, wrapped in the sidebar shell
src/app/actions/        server actions (mutations) — one file per domain
src/components/         UI, grouped by feature
src/lib/api.ts           the only place that talks to the Django backend
src/lib/session.ts       session cookie + current-user resolution
src/lib/auth.ts          requireUser()/requireRole() route guards
src/lib/rbac.ts          role/nav-visibility config (UX, not security)
```

## Scope notes

Matching the original brief's stated limitations: this is a prototype for a
single hospital, staff-only (no patient-facing portal), and does not include
billing, insurance, or inventory modules — all explicitly called out as
future work in the source document.

## Hosting

Two services now need hosting:

- **Frontend (this repo)**: **Vercel** — it's a stock Next.js app, deploys
  with zero config. Set `DJANGO_API_URL` to wherever the backend ends up.
- **Backend (`../meridian-api`)**: needs somewhere that runs a persistent
  Python process (Vercel's serverless model doesn't fit Django well).
  **Railway** or **Render** both work cleanly and can host Postgres
  alongside it — swap `DATABASES` in `core/settings.py` from SQLite before
  deploying, since SQLite is a single file on disk that won't survive a
  redeploy or multiple instances.

If you'd rather run one platform instead of two, **Railway can host both**
services (the Django API and this Next.js app) plus a managed Postgres
instance in the same project — worth it if you want a single dashboard
instead of splitting Vercel + Railway.
