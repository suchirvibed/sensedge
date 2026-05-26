# PrintCard — Project memory

Read this file at the start of every session. It records the project's
shape, conventions and the immutable snapshot tag.

## 🔖 Snapshot

The state of the project at the end of the auth + dashboard build is
preserved at the git tag **`v0.1.0-foundation`**. Treat that tag as
read-only — never `git tag -f` it or rewrite history that contains it.

To inspect or restore the snapshot:

```bash
git show v0.1.0-foundation              # show what the tag points at
git checkout v0.1.0-foundation          # detached HEAD on the snapshot
git diff v0.1.0-foundation..HEAD        # what's changed since snapshot
git switch -c <branch> v0.1.0-foundation  # branch off the snapshot
```

What the snapshot contains:

- Next.js 14 App Router + Tailwind + Prisma 6 + NextAuth v5
- Postgres via `docker-compose` on host port **5433**
- Full Prisma schema and the `20260526054253_init` migration
- Public homepage with framer-motion scroll animations
- Auth pages (`/login`, `/register`), `/api/register`,
  credentials + Google OAuth providers, role-aware JWT
- UserMenu with initials avatar in the public navbar
- `/dashboard` overview, designs, orders, settings (empty states)
- Designer MVP at `/designer/[id]` — Fabric.js canvas, text/image/QR
  fields, live pricing from `lib/pricing.ts`, localStorage autosave
- Service stubs for Razorpay / R2 / Resend / Supabase
- `lib/safe-redirect.ts` rejects open-redirect attempts via `from`-params

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind 3 with design tokens in `tailwind.config.ts` |
| Database | Postgres 16 (docker-compose, port 5433) |
| ORM | Prisma 6 (NOT 7 — datasource URL syntax differs) |
| Auth | NextAuth v5 beta, JWT strategy |
| Canvas | Fabric.js 5 (in `useFabricCanvas`) |
| Animation | framer-motion (`Reveal`, `Stagger`, `CountUp`) |
| Icons | `@tabler/icons-react` |

## Commands

```bash
docker compose up -d                            # Postgres
npx prisma migrate dev --name <change>          # schema changes
npm run dev                                     # http://localhost:3000
npm run build                                   # always run before commits
npm run lint
```

## File layout — where things live

```
app/
  (public)/         marketing pages — uses Navbar/Footer
  (auth)/           login + register pages, minimal auth shell
  dashboard/        customer dashboard (sidebar + header)
  designer/[id]/    Fabric.js card designer (dark theme)
  api/
    auth/[...nextauth]/   NextAuth handler
    register/             POST creates CUSTOMER user

auth.ts             full NextAuth config (Node — Prisma, bcrypt, Google)
auth.config.ts      edge-safe config (used by middleware)
middleware.ts       role-based route guards

components/
  layout/           Navbar, Footer, DashboardSidebar, DashboardHeader
  auth/             UserMenu, GoogleSignInButton
  marketing/        homepage sections
  designer/         Fabric canvas + designer panels
  shared/           SectionHeading, Reveal, CountUp, EmptyState, StatusBadge
  ui/               Button, Badge, Input
  providers/        SessionProvider

lib/
  prisma.ts         Prisma client singleton
  cn.ts             clsx wrapper
  initials.ts       getInitials(name)
  pricing.ts        calculatePrice(input)  — single source of truth
  order-number.ts   PCO-XXXXXX generator
  safe-redirect.ts  sanitises ?from= URLs
  razorpay.ts       stub
  r2.ts             stub
  resend.ts         stub
  supabase.ts       stub

prisma/
  schema.prisma
  migrations/       tracked — never edit historical migrations

docker-compose.yml  local Postgres on host port 5433
.env.local          dev secrets (NOT in git)
.env                Prisma-managed (NOT in git)
```

## Conventions

- **Server components by default.** Only add `"use client"` when you need
  state, effects, or browser APIs.
- **Read sessions on the server** with `await auth()` from `@/auth` whenever
  possible — avoids logged-out flash. Hand the result down as props.
- **Pricing always goes through `lib/pricing.ts`.** Don't duplicate the
  card-price math anywhere else.
- **Redirect destinations from user-controlled URLs** must pass through
  `safeReturnUrl()` from `lib/safe-redirect.ts`.
- **Run `npm run build` before committing.** Lint + typecheck happen there.
- **Use `LinkButton` / `Button` with `showArrow` for primary CTAs** — that
  preserves the small darker-orange arrow box convention.
- **Section headings use `<SectionHeading>`** so the eyebrow + h2 + orange
  divider stay consistent.
- **Designer is desktop-only** (≥ 1024px). Mobile gate is in `DesignerApp`.

## Env vars

| Var | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://printcard:printcard_dev@localhost:5433/printcard` |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes (dev) | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Optional | Required for Google sign-in button |
| `GOOGLE_CLIENT_SECRET` | Optional | "" |
| `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED` | Optional | `"true"` shows the button |
| `RAZORPAY_*`, `R2_*`, `RESEND_*` | No | Stubs activate when blank |

After editing `.env*` you **must** restart `npm run dev` — env vars
aren't hot-reloaded.

## Known follow-ups (not in snapshot)

These are the highest-value next slices:

1. **`POST /api/designs`** + designer "Save to my account" — so the
   designs grid actually populates from DB instead of staying empty
2. **Checkout flow** (3 steps + Razorpay sandbox) + `POST /api/orders`
3. **Order detail page** at `/dashboard/orders/[id]` with status timeline
4. **Graphics review queue** at `/graphics`
5. **Printer job queue** at `/printer`
6. **Admin** at `/admin`
7. **Seed script** with admin / graphics / printer / customer users
