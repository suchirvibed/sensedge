# PrintCard

End-to-end card design & print platform — Next.js 14, Tailwind, Prisma, NextAuth v5.

> **Status:** Foundation + public homepage. Designer, dashboards, checkout, and
> API routes are scoped in the full project spec but not yet implemented.

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Start local Postgres

```bash
docker compose up -d
```

Postgres runs on `localhost:5432` with credentials `printcard / printcard_dev`.

### 3. Configure environment

`.env.local` is already created with development defaults. The only thing you
need to set right now is `NEXTAUTH_SECRET`:

```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Min 0 -Max 255 }))
```

Razorpay, Cloudflare R2, Resend, and Supabase env vars are left blank — the
client libs in `lib/` detect missing credentials and fall back to dev stubs
that log to console instead of throwing.

### 4. Run migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start the dev server

```bash
npm run dev
```

Open <http://localhost:3000>.

## What's built

### Foundation

- **Next.js 14** App Router, TypeScript, Tailwind
- **Design tokens** — every colour, font, spacing, radius, and shadow from
  the spec lives in `tailwind.config.ts` and `app/globals.css`
- **Prisma 6 schema** — full model coverage: `User`, `Design`, `Order`,
  `PrintJob`, `Template`, `Product`, `Address`, `Payment`, `OrderStatusLog`
  with every enum from the spec
- **NextAuth v5** with credentials provider; role embedded in JWT/session
- **Middleware** enforcing role-based access on `/dashboard`, `/graphics`,
  `/printer`, `/admin` (split config so the middleware stays edge-safe)
- **Base components** — `Button` / `LinkButton`, `Badge`, `Input`,
  `SectionHeading`, `StatusBadge`, `ServiceCard`
- **Navbar** (sticky, 88px) + **Footer** (dark, 4-column)
- **Pricing engine** in `lib/pricing.ts` (per-card base, finish/chip/side
  add-ons, bulk discounts, free-shipping threshold)
- **Order number generator** in `lib/order-number.ts` (`PCO-000123`)
- **Stub clients** for Razorpay, R2, Resend, Supabase that return useful
  dev placeholders instead of throwing

### Public homepage (`/`)

All 10 marketing sections from the spec:

1. Hero (CSS card mockup, no images required)
2. Ticker (animated infinite scroll)
3. Card Types Grid (6 service cards)
4. Stats (dark)
5. How It Works (3 steps)
6. Designer Preview (dark, mock studio screenshot)
7. Pricing (3 tiers, Business highlighted)
8. Trust Pillars (6 icons)
9. Testimonials (slider with 01/03 counter)
10. CTA Block

## What's next

The biggest pieces still to build, in priority order:

| Slice | Effort | What it unlocks |
|---|---|---|
| `(auth)` group with `/login` + `/register` pages | 1 session | End-to-end auth |
| Customer `/dashboard` (overview, orders, designs) | 2 sessions | First real flow |
| `/designer/[id]` — Fabric.js canvas + autosave | 3 sessions | The core product |
| Checkout (3-step + Razorpay) | 2 sessions | Revenue |
| Graphics `/graphics` review queue | 1 session | Internal workflow |
| Printer `/printer` job queue | 1 session | Internal workflow |
| Admin `/admin` (orders, users, pricing) | 2 sessions | Operations |
| API routes (`/api/designs`, `/api/orders`, etc.) | 2 sessions | Powers everything above |
| Seed script with admin/graphics/printer/customer users | 0.5 session | Onboarding |

A "session" here is roughly one Claude Code working session. Build one
vertical slice at a time and run `npm run build` between slices.

## Project structure

```
app/
  (public)/              # Marketing pages — uses Navbar + Footer layout
    page.tsx             # Homepage (composes all marketing sections)
    layout.tsx
  api/auth/[...nextauth] # NextAuth v5 handler
  globals.css            # Design tokens + utility classes
  layout.tsx             # Root layout
auth.ts                  # Full NextAuth config (Node — used by API routes)
auth.config.ts           # Edge-safe config (used by middleware)
middleware.ts            # Role-based route guards
components/
  layout/                # Navbar, Footer
  marketing/             # All 10 homepage sections
  shared/                # SectionHeading, ServiceCard, StatusBadge
  ui/                    # Button, Badge, Input
lib/
  cn.ts                  # clsx wrapper
  prisma.ts              # Prisma client singleton
  pricing.ts             # Price calculation engine
  order-number.ts        # PCO-XXXXXX generator
  razorpay.ts            # Stub client
  r2.ts                  # Stub client
  resend.ts              # Stub client
  supabase.ts            # Stub client
prisma/
  schema.prisma          # Full database schema
docker-compose.yml       # Local Postgres
tailwind.config.ts       # Design tokens
```

## Useful commands

```bash
npm run dev          # Dev server
npm run build        # Production build (run between every slice)
npm run lint         # ESLint
npx prisma studio    # Visual DB browser at localhost:5555
npx prisma migrate dev --name <change-name>
docker compose down  # Stop Postgres
```

## Design system notes

- Brand orange: `#E85D04`. Use as `bg-orange`, `text-orange`.
- Page background: warm off-white `#f0efe8` (`bg-bg-page`), **not** white.
- Dark sections use `#17191a` (`bg-bg-dark`). Hero dark variant uses
  `#111115` (`bg-bg-darker`).
- Headings always use Plus Jakarta Sans (`font-display`). Body is Inter.
- Every section heading uses the `<SectionHeading>` component to keep the
  orange `■` eyebrow + h2 + orange divider pattern consistent.
- Primary buttons use the `LinkButton` component with `showArrow` for the
  small darker-orange arrow box on the right.
