# PawStay — Product Requirements Document (PRD)

**Version:** 1.0
**Date:** February 2026
**Status:** Draft
**Author:** Miguel

---

## 1. Executive Summary

PawStay is a two-sided marketplace that connects pet owners with professional pet hotel operators. Pet owners can search, compare, and book boarding, daycare, grooming, training, and other pet care services. Hotel operators can list their facilities, manage availability, set pricing, and grow their business.

The platform supports all common pet types: dogs, cats, birds, rabbits, small animals (hamsters, guinea pigs), and reptiles.

---

## 2. Problem Statement

### For Pet Owners
- Finding reliable, specialized pet accommodation is fragmented. Most search happens via Google, local Facebook groups, or word-of-mouth.
- There is no unified platform to compare pricing, read verified reviews, check availability in real time, and book with confidence.
- Pet owners have no way to match their specific pet type (e.g. reptile, exotic bird) to facilities that actually support them.

### For Pet Hotel Operators
- Most small/medium pet hotels have no online booking system. They rely on phone calls, WhatsApp, and manual calendars.
- They lack tools to manage multiple booking types (overnight boarding vs. daycare vs. grooming) on one platform.
- They have no digital channel to attract new customers beyond their immediate geography.

---

## 3. Goals & Success Metrics

| Goal | Metric | Target (12 months) |
|------|--------|--------------------|
| Grow supply | Registered pet hotels | 200+ |
| Grow demand | Registered pet owners | 5,000+ |
| Drive transactions | Completed bookings | 3,000+ |
| Quality | Average review score | ≥ 4.3 / 5 |
| Revenue | GMV (Gross Merchandise Value) | $150,000+ |

---

## 4. User Personas

### 4.1 Pet Owner — "Ana"
- Age 28–45, urban professional, 1–2 pets
- Books travel or work trips 4–8x per year and needs reliable pet care
- Values trust, reviews, photos, and transparent pricing
- Wants to quickly find facilities that accept her specific pet (e.g., a parrot)

### 4.2 Pet Hotel Operator — "Carlos"
- Owns or manages a small/medium pet boarding facility (5–50 animals at a time)
- Not very technical but owns a smartphone and uses WhatsApp
- Wants more bookings without spending time on admin
- Needs a simple calendar to manage availability and avoid double bookings

### 4.3 Platform Admin — "Platform Team"
- Manages hotel onboarding and verification
- Monitors booking disputes and reviews
- Tracks platform health metrics

---

## 5. Features & Requirements

### 5.1 Authentication & Onboarding

**Pet Owner Registration**
- Sign up with email/password or Google OAuth
- Profile: name, photo, city, pets list
- Must add at least one pet before booking

**Hotel Operator Registration**
- Sign up with email/password or Google OAuth
- Multi-step onboarding wizard:
  1. Business details (name, address, description)
  2. Services offered
  3. Pet types accepted
  4. Photos upload (min 3)
  5. Pricing setup
  6. Availability calendar
- Operator account marked as "pending review" until admin approves listing

**Role Selection**
- At signup, user selects role: "I'm looking for pet care" or "I run a pet care business"
- Roles can coexist (an operator can also be a pet owner)

---

### 5.2 Pet Profiles

Each pet owner can manage multiple pet profiles:
- Name, species, breed, age, weight
- Vaccination status (upload document)
- Special needs / medical notes
- Emergency vet contact
- Photos

**Supported species:** Dog, Cat, Bird (parrot, canary, etc.), Rabbit, Hamster/Guinea Pig, Reptile (lizard, turtle, snake), Other

---

### 5.3 Hotel Listings

**Hotel Profile Page includes:**
- Name, cover photo, photo gallery (up to 20 photos)
- Description (rich text)
- Address + Google Maps embed
- Star rating (auto-calculated from reviews)
- Services offered (see 5.4)
- Pet types accepted
- Amenities (outdoor play area, webcam, vet on-call, grooming, 24h staff, etc.)
- Pricing overview
- Availability calendar (read-only for visitors)
- Reviews section
- "Book Now" CTA

**Listing Status:**
- Draft (operator editing)
- Pending (submitted, awaiting admin approval)
- Active (published and searchable)
- Suspended (admin action)

---

### 5.4 Services

Each hotel can offer any combination of:

| Service | Description |
|---------|-------------|
| Overnight Boarding | Multi-night stays for pets |
| Day Care | Drop-off and pick-up same day |
| Grooming | Bathing, haircut, nail trim |
| Training | Basic or advanced training sessions |
| Vet Consultation | On-site or partnered vet visits |
| Solo Walking | Daily walks for dogs |

For each service, the operator sets:
- Name & description
- Price (per night / per session / per hour)
- Duration (for sessions)
- Max capacity (e.g., max 5 dogs in daycare at once)
- Pet types applicable
- Size/weight restrictions (e.g., dogs under 20kg only)

---

### 5.5 Search & Discovery

**Search Inputs:**
- Location (city, neighborhood, or "near me")
- Check-in / Check-out dates (or single date for daycare/grooming)
- Pet type
- Number of pets
- Service type

**Filters:**
- Price range (per night / per session)
- Minimum rating
- Amenities (checkboxes)
- Pet size accepted
- Distance radius

**Sort Options:**
- Relevance (default)
- Price: low to high / high to low
- Rating
- Distance

**Search Results:**
- Hotel cards with: photo, name, address, price from, rating, number of reviews, accepted pets icons
- Map view toggle (Google Maps with pins)
- Pagination (20 results per page)

---

### 5.6 Booking Flow

**Step 1 — Select Service & Room**
- Choose service (boarding, daycare, etc.)
- Select room/kennel type (if hotel has multiple room types)
- Pick dates (calendar)
- Select pet(s) from profile

**Step 2 — Review & Confirm Details**
- Booking summary
- Price breakdown (base + taxes + platform fee)
- Cancellation policy
- Special requests (text field)

**Step 3 — Payment**
- Stripe Checkout integration
- Supported: credit/debit cards
- Platform fee: 10% of booking total (deducted from operator payout)
- Pet owner pays full amount upfront

**Step 4 — Confirmation**
- Booking confirmation email (Resend)
- Booking appears in owner dashboard
- Hotel operator receives notification

**Booking Statuses:**
- Pending (awaiting operator confirmation — optional manual approval per hotel setting)
- Confirmed
- Active (pet is checked in)
- Completed
- Cancelled (by owner or operator)
- No-show

---

### 5.7 Cancellation Policy

Hotels choose one of three preset policies:
- **Flexible:** Full refund if cancelled 24h before check-in
- **Moderate:** 50% refund if cancelled 5 days before check-in
- **Strict:** No refund after booking

---

### 5.8 Reviews & Ratings

- Review can be submitted by pet owner after booking is Completed
- Fields: overall rating (1–5 stars), written review (min 50 chars), optional photo
- Operator can reply to a review (one reply per review)
- Rating breakdown: Cleanliness, Staff, Safety, Value for Money
- Reviews are public on the hotel listing page
- Admin can flag/remove inappropriate reviews

---

### 5.9 Messaging

- In-app chat between pet owner and hotel operator (per booking context)
- Unread message badge in nav
- Email notification for new messages (with reply link)
- No direct chat before booking is confirmed (to prevent off-platform bookings)
  - Exception: owners can send one "pre-booking inquiry" message

---

### 5.10 Pet Owner Dashboard

- Upcoming bookings (with check-in countdown)
- Past bookings
- My pets (CRUD)
- Saved/favorited hotels
- Messages inbox
- Account settings

---

### 5.11 Hotel Operator Dashboard

- Booking calendar (month/week view)
- Bookings list (filterable by status, date, service)
- Availability management (block dates, set recurring availability)
- Revenue overview (total earnings, pending payouts, platform fees)
- Listing editor
- Messages inbox
- Reviews received
- Payout settings (bank account via Stripe Connect)

---

### 5.12 Admin Panel

- User management (view, suspend, delete)
- Hotel listing approval queue
- Booking overview (all bookings across platform)
- Review moderation queue
- Platform revenue metrics
- Dispute management

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Search results < 2s, pages load < 1.5s (Core Web Vitals green) |
| Scalability | Architecture supports 10,000 concurrent users |
| Security | RLS on all Supabase tables, HTTPS only, Stripe PCI compliance |
| Accessibility | WCAG 2.1 AA |
| SEO | Server-side rendered listing pages, sitemap, structured data (JSON-LD) |
| Mobile | Fully responsive, touch-friendly, PWA-ready |
| Reliability | 99.9% uptime target (Vercel + Supabase SLAs) |

---

## 7. Out of Scope (v1)

- Native mobile apps (iOS/Android)
- Multi-language support
- Recurring bookings / subscription plans
- Live webcam feeds
- AI-powered pet matching recommendations
- Operator invoicing / accounting exports

---

## 8. Monetization

| Stream | Details |
|--------|---------|
| Platform fee | 10% of every booking (charged to pet owner at checkout) |
| Featured listings | Operators pay to appear at top of search results (v2) |
| Subscription plans | Operator Premium tier with analytics, priority support (v2) |

---

## 9. Risks

| Risk | Mitigation |
|------|-----------|
| Low initial supply of hotels | Outreach campaign; make onboarding frictionless |
| Trust in unknown operators | Require approval, photos, reviews from day one |
| Payment disputes | Clear cancellation policies; Stripe dispute handling |
| Low pet owner retention | Email reminders for upcoming travel; loyalty perks (v2) |
| Competition from established platforms | Focus on niche (all pet types, not just dogs) |
