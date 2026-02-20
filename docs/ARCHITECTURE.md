# PawStay — Technical Architecture

**Version:** 1.0
**Date:** February 2026

---

## 1. High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTS                          │
│   Browser (Next.js SSR/CSR)  │  Mobile Browser     │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────────┐
│              NEXT.JS APP (Vercel)                   │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ App Router  │  │ Server       │  │ API Route │  │
│  │ (RSC/SSR)   │  │ Actions      │  │ Handlers  │  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┼──────────────┐
        │          │              │
┌───────▼──┐  ┌────▼────┐  ┌─────▼──────┐
│ Supabase │  │ Stripe  │  │  Resend    │
│          │  │         │  │  (Email)   │
│ - Auth   │  │ - Pay.  │  └────────────┘
│ - DB     │  │ - Connect        │
│ - Storage│  │ - Webhooks       │
│ - Realtime│ └─────────┘  ┌─────▼──────┐
│ - Edge Fn│               │  Google    │
└──────────┘               │  Maps API  │
                           └────────────┘
```

---

## 2. Frontend Architecture

### Framework & Rendering Strategy

**Next.js 15 with App Router**

| Route Type | Rendering | Reason |
|-----------|-----------|--------|
| `/` (homepage) | SSG | Static marketing page, fast load |
| `/search` | SSR | Dynamic results, SEO |
| `/hotels/[slug]` | SSR + ISR | SEO critical, revalidate every 60s |
| `/book/[id]` | CSR | Dynamic user flow, no SEO needed |
| `/dashboard/*` | CSR (protected) | Authenticated, no SEO needed |
| `/admin/*` | CSR (protected) | Authenticated, admin only |

### Folder Structure

```
src/
├── app/
│   ├── (public)/              # Public routes
│   │   ├── page.tsx           # Homepage
│   │   ├── search/page.tsx    # Search results
│   │   ├── hotels/
│   │   │   └── [slug]/page.tsx
│   │   └── blog/              # v2
│   ├── (auth)/                # Auth routes (no sidebar)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── onboarding/
│   │       ├── pet-owner/page.tsx
│   │       └── operator/
│   │           └── [...step]/page.tsx
│   ├── (owner)/               # Pet owner dashboard
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── bookings/page.tsx
│   │   ├── pets/page.tsx
│   │   ├── favorites/page.tsx
│   │   └── messages/page.tsx
│   ├── (operator)/            # Hotel operator dashboard
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── listings/page.tsx
│   │   ├── bookings/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── messages/page.tsx
│   │   └── settings/page.tsx
│   ├── (admin)/               # Admin panel
│   │   ├── layout.tsx
│   │   └── ...
│   ├── api/                   # API Routes
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts
│   │   └── og/route.tsx       # Open Graph image generation
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # Atomic design components
│   ├── forms/                 # Form components
│   ├── maps/                  # Google Maps wrappers
│   ├── booking/               # Booking flow components
│   └── dashboard/             # Dashboard-specific
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser Supabase client
│   │   ├── server.ts          # Server Supabase client
│   │   └── middleware.ts      # Auth middleware
│   ├── stripe/
│   │   ├── client.ts
│   │   └── webhooks.ts
│   ├── resend/
│   │   └── emails.ts
│   ├── validations/           # Zod schemas
│   └── types.ts               # TypeScript types
├── actions/                   # Server Actions
│   ├── auth.ts
│   ├── hotels.ts
│   ├── bookings.ts
│   ├── pets.ts
│   └── reviews.ts
└── middleware.ts               # Route protection
```

### State Management Strategy

- **Server State:** React Server Components + Supabase direct queries
- **Client State:** React `useState` / `useReducer` (no Redux needed)
- **Auth State:** Supabase Auth context via provider
- **Forms:** React Hook Form + Zod validation
- **Data Fetching:** Native Next.js fetch with caching + Server Actions for mutations

### UI Component Library

- **Base:** Tailwind CSS v4
- **Components:** shadcn/ui (Radix primitives)
- **Icons:** Lucide React
- **Dates:** React Day Picker
- **Maps:** @vis.gl/react-google-maps
- **Charts (dashboard):** Recharts
- **Image uploads:** Supabase Storage + direct upload from client

---

## 3. Backend Architecture

### Supabase as BaaS

PawStay uses Supabase as the primary backend, leveraging:

#### 3.1 Authentication
- Email/password (with email verification)
- Google OAuth
- Auth sessions managed server-side via Supabase SSR package
- Custom `profiles` table extends `auth.users` with role and onboarding status

#### 3.2 Database (PostgreSQL)
- All business data stored in Supabase PostgreSQL
- Row Level Security (RLS) enforced on every table
- DB functions/triggers for:
  - Auto-creating profile on user signup
  - Updating `hotels.rating` when a review is inserted/updated
  - Updating `bookings.total_price` based on service pricing

#### 3.3 Storage Buckets
| Bucket | Content | Access |
|--------|---------|--------|
| `hotel-photos` | Hotel listing images | Public read |
| `pet-photos` | Pet profile photos | Auth read |
| `documents` | Vaccination certs, ID docs | Private (owner + admin) |

#### 3.4 Realtime
- Supabase Realtime channels for:
  - In-app messaging (new messages trigger instant delivery)
  - Operator dashboard: new booking notifications
  - Admin panel: live booking feed

#### 3.5 Edge Functions (Supabase)
Used sparingly for operations that cannot be done in Next.js API routes:
- `send-booking-confirmation` — triggered by DB webhook on booking creation
- `calculate-payout` — called when booking status → Completed

### Next.js API Routes

Used for Stripe webhook handling only (requires raw body parsing):

| Route | Purpose |
|-------|---------|
| `POST /api/webhooks/stripe` | Handle payment events |

### Server Actions

All mutations go through typed Server Actions (not API routes), giving:
- Automatic CSRF protection
- Type-safe end-to-end
- No client fetch boilerplate

---

## 4. Payment Architecture (Stripe)

```
Pet Owner                     PawStay                    Operator
    │                             │                          │
    │── Pay $100 ────────────────►│                          │
    │   (Stripe Checkout)         │                          │
    │                             │── Stripe Connect ───────►│
    │                             │   Operator receives $90  │
    │                             │   Platform keeps $10 (10%)│
    │◄── Confirmation email ──────│                          │
```

- **Stripe Checkout Sessions** for collecting payment from pet owners
- **Stripe Connect (Express accounts)** for operator payouts
- **Stripe webhooks** for payment confirmation → booking confirmation
- **Stripe Radar** for fraud prevention (built-in)
- All prices stored in smallest currency unit (cents)

**Payment Flow:**
1. Pet owner initiates booking
2. Server creates Stripe Checkout Session with `application_fee_amount`
3. Pet owner completes payment on Stripe-hosted page
4. Stripe webhook fires `checkout.session.completed`
5. Server creates booking record in DB with status = Confirmed
6. Confirmation email sent via Resend

---

## 5. Email Architecture (Resend)

| Template | Trigger | Recipient |
|----------|---------|-----------|
| Booking Confirmation | Booking confirmed | Pet owner |
| New Booking Alert | Booking confirmed | Operator |
| Booking Cancelled | Booking cancelled | Both |
| New Message | Message received | Recipient |
| Review Request | Booking completed + 24h | Pet owner |
| Welcome | User signup | New user |
| Operator Listing Approved | Admin approves listing | Operator |

All email templates built with **React Email** components.

---

## 6. Infrastructure & Deployment

| Service | Purpose | Tier |
|---------|---------|------|
| Vercel | Next.js hosting + CDN | Hobby → Pro |
| Supabase | DB + Auth + Storage + Realtime | Free → Pro |
| Stripe | Payments | Pay-as-you-go |
| Resend | Transactional email | Free → Paid |
| Google Maps Platform | Maps + Places autocomplete | Pay-as-you-go |

### Environments
- **Development:** Local Next.js dev server + Supabase local (Docker)
- **Staging:** Vercel Preview Deployments + Supabase staging project
- **Production:** Vercel Production + Supabase production project

### CI/CD
- GitHub → Vercel (auto-deploy on push to `main`)
- Supabase migrations via `supabase db push` in CI
- Environment variables managed in Vercel dashboard

---

## 7. Security Architecture

### Authentication & Authorization
- JWT tokens managed by Supabase Auth (short-lived, auto-refresh)
- Middleware protects all `(owner)`, `(operator)`, `(admin)` routes
- Role checked in middleware + enforced again in Server Actions (defense in depth)

### Database Security
- **RLS enabled on all tables** — no table is publicly writable
- Service role key never exposed to client
- `anon` key only used for public read operations

### API Security
- Server Actions validate all inputs with Zod before DB operations
- Rate limiting via Vercel Edge middleware (IP-based)
- Stripe webhook signature verified on every request

### Data Privacy
- PII (pet health data, emergency contacts) stored in Supabase with encryption at rest
- Vaccination document uploads restricted to private bucket
- GDPR: user data deletion flow available in account settings

---

## 8. Performance Strategy

| Technique | Applied To |
|-----------|-----------|
| ISR (60s revalidation) | Hotel detail pages |
| Static generation | Homepage, marketing pages |
| Image optimization | Next/Image for all hotel/pet photos |
| Database indexes | `hotels.location`, `bookings.owner_id`, `bookings.hotel_id` |
| Supabase connection pooling | Via Supavisor (built-in) |
| CDN caching | Vercel Edge for static assets |
| Lazy loading | Dashboard charts, map view |
