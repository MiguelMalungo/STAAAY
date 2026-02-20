# 🐾 PawStay

**A two-sided marketplace for pet hotel bookings.**

PawStay connects pet owners with professional pet care facilities — boarding, day care, grooming, training, and more — for all common pet types: dogs, cats, birds, rabbits, small animals, and reptiles.

---

## 📁 Project Documentation

All planning documents are in the `/docs` folder:

| File | Description |
|------|-------------|
| [`docs/PRD.md`](docs/PRD.md) | Product Requirements Document — features, user personas, monetization, risks |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Technical architecture — stack, folder structure, rendering strategy, security |
| [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) | Full Supabase SQL schema with RLS policies and triggers |
| [`docs/API_DESIGN.md`](docs/API_DESIGN.md) | Server Actions, HTTP endpoints, Realtime subscriptions, TypeScript types |
| [`docs/SPRINTS_AND_TASKS.md`](docs/SPRINTS_AND_TASKS.md) | 7 sprints × 22 agent-ready tasks (feed directly to AI coding agent) |
| [`docs/CHRONOGRAM.xlsx`](docs/CHRONOGRAM.xlsx) | Visual Gantt chart + sprint overview + detailed task list (Excel) |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Supabase Auth (email + Google OAuth) |
| Database | Supabase PostgreSQL with RLS |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime channels |
| Payments | Stripe Checkout + Stripe Connect |
| Email | Resend + React Email |
| Maps | Google Maps Platform |
| Deployment | Vercel |

---

## 📅 Timeline

**Total: 14 weeks** for a solo developer (~24 hrs/week)

| Sprint | Weeks | Focus |
|--------|-------|-------|
| Sprint 1 | 1–2 | Foundation, Auth, DB setup |
| Sprint 2 | 3–4 | Hotel Operator features |
| Sprint 3 | 5–6 | Search & Discovery |
| Sprint 4 | 7–8 | Booking Flow & Stripe |
| Sprint 5 | 9–10 | Reviews & Real-time Messaging |
| Sprint 6 | 11–12 | Dashboards & Admin Panel |
| Sprint 7 | 13–14 | SEO, Polish & Launch |

---

## 🚀 How to Use the Sprint Tasks

Each task in `docs/SPRINTS_AND_TASKS.md` is a self-contained, structured prompt. To use with an AI coding agent:

1. Open the sprint file
2. Copy a task's **Agent Prompt** block
3. Paste it into your AI coding agent (Claude, Cursor, etc.)
4. The agent has everything it needs: context, file paths, and expected outputs

Work through tasks sequentially within each sprint. Dependencies between tasks are implicit in the sprint order.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in all values before development.

Required services to set up:
- [Supabase](https://supabase.com) — create a new project
- [Stripe](https://stripe.com) — get API keys + set up Connect
- [Google Cloud Console](https://console.cloud.google.com) — enable Maps + Places APIs
- [Resend](https://resend.com) — add and verify your sending domain

---

*Built with ❤️ for pets everywhere.*
