# Jengo

Property Management SaaS for Kenyan high-rise residential buildings. Connects **Owners**, **Property Managers**, and **Tenants** with native M-Pesa rent collection, maintenance management, and communication.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL, Auth, RLS, Edge Functions)
- **Payments:** Safaricom Daraja M-Pesa STK Push
- **SMS:** Africa's Talking
- **Email:** Resend

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase account and project

### Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in credentials from the Supabase dashboard **Connect** dialog:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` (server only — never expose to the browser)
   - `SUPABASE_JWKS_URL` (JWT verification for `auth: "user"`)

   Also set the matching `NEXT_PUBLIC_*` vars for client-side `@supabase/ssr`.

4. Apply database migrations:

```bash
npx supabase db push
# or run migrations manually in Supabase SQL editor:
# supabase/migrations/0001_initial_schema.sql
# supabase/migrations/0002_auth_tables.sql
# supabase/migrations/0003_rls_policies.sql
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API routes (`@supabase/server`)

Route handlers use `withSupabaseRoute` from `@/lib/supabase/with-supabase-route`, which wraps `@supabase/server` and composes with `@supabase/ssr` for cookie-based sessions:

```ts
import { withSupabaseRoute } from '@/lib/supabase/with-supabase-route'

export const GET = withSupabaseRoute({ auth: 'user' }, async (_req, ctx) => {
  const { data } = await ctx.supabase.from('buildings').select()
  return Response.json(data)
})
```

| Auth mode | Use case |
|-----------|----------|
| `"user"` | Authenticated routes (JWT from session cookie or `Authorization` header) |
| `"none"` | Public/webhook routes — use `ctx.supabaseAdmin` for privileged writes |
| `"secret"` | Server-to-server calls with `apikey` header |
| `"publishable"` | Client-gated anonymous routes with publishable key |

### Owner Sign-Up Flow

1. Visit `/auth/signup`
2. Create account → Organization details → Choose plan
3. Redirected to owner dashboard

Property Managers and Tenants are invite-only (created by Owner/PM).

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (authenticated)/  # Protected routes with sidebar layout
│   ├── auth/             # Login, signup, forgot password
│   └── api/              # API routes (M-Pesa, auth)
├── components/           # UI and feature components
├── lib/                  # Supabase clients, hooks, validations
├── services/             # Business logic layer
└── types/                # TypeScript types

supabase/
├── migrations/           # PostgreSQL schema + RLS
├── seeds/                # Development seed data
└── functions/            # Edge functions (M-Pesa, invoices, SMS)
```

## User Roles

| Role | Dashboard |
|------|-----------|
| Owner | `/dashboard` — Portfolio-wide view |
| Property Manager | `/buildings` — Assigned buildings |
| Tenant | `/tenant/portal` — Personal unit portal |
| Caretaker | `/maintenance` — Maintenance tasks |

## M-Pesa Integration

Configure Daraja API credentials in `.env.local`. STK Push flow:

1. Tenant initiates payment → `/api/payments/mpesa/stk-push`
2. Safaricom sends callback → `/api/payments/mpesa/callback`
3. Payment confirmed, invoice marked paid

## License

Proprietary — All rights reserved.
