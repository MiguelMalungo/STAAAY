# PawStay — Sprints & Agent-Ready Tasks

**Version:** 1.0
**Date:** February 2026
**Total duration:** 14 weeks (solo developer)

Each task below is written as a self-contained prompt ready to be fed to an AI coding agent. Tasks include context, file paths, and expected outputs so the agent can work with minimal ambiguity.

---

## SPRINT 1 — Foundation & Authentication (Weeks 1–2)

**Goal:** Working app skeleton with auth, roles, and routing structure.

---

### TASK 1.1 — Project Initialization

**Agent Prompt:**
```
Initialize a new Next.js 15 project called "pawstay" using the App Router with TypeScript and Tailwind CSS v4.

Install these dependencies:
- @supabase/supabase-js @supabase/ssr
- shadcn/ui (init with default config)
- react-hook-form zod @hookform/resolvers
- lucide-react
- react-day-picker date-fns
- @vis.gl/react-google-maps

Install dev dependencies:
- supabase (CLI)

Create the folder structure as defined in ARCHITECTURE.md section 2.

Set up environment variables in .env.local with placeholders:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- RESEND_API_KEY
- NEXT_PUBLIC_APP_URL

Create a .env.example file with the same keys (empty values).

Expected output: runnable Next.js app on http://localhost:3000 showing default page.
```

---

### TASK 1.2 — Supabase Project Setup & Database Schema

**Agent Prompt:**
```
Set up Supabase for the PawStay project.

1. Create a new Supabase project via CLI: `supabase init`
2. Create migration file: supabase/migrations/001_initial_schema.sql

In the migration file, implement ALL SQL from DATABASE_SCHEMA.md exactly as written:
- All ENUM types
- All tables with their columns, constraints, and defaults
- All RLS policies
- The handle_new_user() trigger
- The update_hotel_rating() trigger
- All indexes
- Storage bucket policies

3. Create supabase/seed.sql with test data:
   - 1 admin user
   - 2 hotel operator users
   - 2 pet owner users
   - 3 hotel listings (1 pending, 2 active) with services, photos
   - 5 pets
   - 3 bookings (1 confirmed, 1 completed, 1 cancelled)
   - 2 reviews

4. Create src/lib/supabase/client.ts — browser Supabase client
5. Create src/lib/supabase/server.ts — server Supabase client (using @supabase/ssr)
6. Create src/lib/supabase/middleware.ts — session refresh middleware
7. Create src/middleware.ts — route protection:
   - Redirect unauthenticated users away from /dashboard, /owner/*, /operator/*, /admin/*
   - Redirect authenticated users away from /login, /signup
   - Check role: only 'hotel_operator' or 'admin' can access /operator/*
   - Check role: only 'admin' can access /admin/*

Expected output: database schema applied, TypeScript clients working, middleware protecting routes.
```

---

### TASK 1.3 — Authentication UI & Logic

**Agent Prompt:**
```
Implement complete authentication for PawStay using Supabase Auth.

Create these pages and components:

1. src/app/(auth)/login/page.tsx
   - Email/password login form
   - Google OAuth button
   - "Forgot password" link (placeholder for now)
   - Link to /signup

2. src/app/(auth)/signup/page.tsx
   - Role selection first ("I'm looking for pet care" | "I run a pet care business")
   - Full name, email, password fields
   - Google OAuth button (passes role via metadata)
   - Link to /login

3. src/actions/auth.ts — implement:
   - signUp(input) — creates Supabase auth user with role in metadata
   - signIn(input)
   - signOut()
   - getAuthUser() — helper used by all other actions

4. src/components/auth/AuthProvider.tsx
   - Wraps app in Supabase auth context
   - Provides useUser() hook

5. After signup, redirect to correct onboarding:
   - pet_owner → /onboarding/owner
   - hotel_operator → /onboarding/operator/step/1

6. src/app/(auth)/onboarding/owner/page.tsx
   - Simple form: phone, city
   - On submit: calls completeOnboarding(), redirects to /owner/dashboard

7. src/app/(auth)/onboarding/operator/step/[step]/page.tsx
   - Multi-step wizard (steps 1–5, deferred to Sprint 2 for full implementation)
   - Step 1: Business name and city (basic placeholder)
   - Redirect to /operator/dashboard after step 1 for now

Use shadcn/ui Form, Input, Button components. Show loading state during async operations. Display Zod validation errors inline.

Expected output: fully working signup, login, logout, and basic onboarding flows.
```

---

### TASK 1.4 — Navigation & Layout

**Agent Prompt:**
```
Create the shared layouts and navigation for PawStay.

1. src/app/layout.tsx — root layout with AuthProvider, Toaster (shadcn/ui)

2. src/components/ui/Header.tsx — top navigation:
   - Logo (text "PawStay" with paw icon for now)
   - "Find Pet Care" nav link → /search
   - If unauthenticated: "Log in" | "Sign up" buttons
   - If authenticated as pet_owner: avatar dropdown → "My Bookings", "My Pets", "Messages", "Log out"
   - If authenticated as hotel_operator: avatar dropdown → "My Dashboard", "My Listings", "Messages", "Log out"
   - Unread message badge on "Messages" link (real-time, deferred to Sprint 5)
   - Fully responsive (hamburger menu on mobile)

3. src/app/(owner)/layout.tsx — owner dashboard layout:
   - Left sidebar with links: Dashboard, Bookings, My Pets, Favorites, Messages
   - Mobile: bottom tab bar

4. src/app/(operator)/layout.tsx — operator dashboard layout:
   - Left sidebar with links: Dashboard, Bookings, Calendar, Listings, Messages, Settings
   - Mobile: bottom tab bar

5. src/components/ui/Footer.tsx:
   - Links: About, How it works, For pet hotels, Blog (v2), Support
   - © 2026 PawStay

6. src/app/(public)/page.tsx — homepage:
   - Hero section with search bar (city input + "Check availability" button → /search)
   - "How it works" section (3 steps for pet owners)
   - "Why list with PawStay" section (3 steps for operators)
   - Featured hotel types section (static placeholder cards)
   - CTA section

Expected output: consistent, responsive layouts across all route groups.
```

---

## SPRINT 2 — Hotel Operator Features (Weeks 3–4)

**Goal:** Operators can fully onboard, create listings, add services, and manage availability.

---

### TASK 2.1 — Operator Onboarding Wizard

**Agent Prompt:**
```
Implement the full 5-step hotel operator onboarding wizard at:
src/app/(auth)/onboarding/operator/step/[step]/page.tsx

Step 1 — Business Details:
- Hotel name (required)
- Full address (Google Places Autocomplete for city/address)
- Phone number
- Website (optional)
- Business description (textarea, min 100 chars)

Step 2 — Services Offered:
- Multi-select checkboxes: Overnight Boarding, Day Care, Grooming, Training, Vet Consultation, Solo Walking
- Must select at least 1

Step 3 — Pet Types Accepted:
- Multi-select with species icons: Dog, Cat, Bird, Rabbit, Small Animal, Reptile, Other

Step 4 — Photos:
- Drag-and-drop upload area
- Direct upload to Supabase Storage bucket 'hotel-photos'
- Minimum 3 photos required, max 20
- Preview grid with ability to reorder and set cover photo

Step 5 — Pricing & Policy:
- For each selected service (from Step 2), set:
  - Price (number input)
  - Unit (per night / per session / per hour)
  - Brief description
- Cancellation policy selector: Flexible / Moderate / Strict (with tooltip explaining each)

Navigation: "Back" and "Continue" buttons. Progress indicator at top. Form state persisted in sessionStorage between steps.

On completion:
1. Call createHotel() server action with all collected data
2. Create hotel_services records for each service
3. Set hotel status to 'pending'
4. Redirect to /operator/dashboard showing "Your listing is under review" message

Expected output: complete, functional onboarding wizard that creates a real DB record.
```

---

### TASK 2.2 — Hotel Listing Editor

**Agent Prompt:**
```
Create the hotel listing editor for operators to update their listing after onboarding.

Route: src/app/(operator)/listings/[hotelId]/edit/page.tsx

Implement tabbed editor with these sections:

Tab 1: Basic Info
- Editable: name, description, address, phone, email, website
- Map preview showing pin at current coordinates

Tab 2: Services
- Table of existing services with inline edit
- "Add service" button opens a modal with the HotelServiceForm
- Toggle to activate/deactivate each service
- Delete service (with confirmation)

Tab 3: Photos
- Current photos grid with drag-to-reorder
- Delete photo button
- Upload new photos (direct to Supabase Storage)
- Set cover photo

Tab 4: Pet Types & Amenities
- Multi-select for acceptedSpecies
- Amenity checkboxes:
  [ ] Outdoor play area
  [ ] Indoor play area
  [ ] Webcam access
  [ ] 24/7 staff
  [ ] Groomer on staff
  [ ] Vet on call
  [ ] Air conditioning
  [ ] Individual sleeping areas
  [ ] Group socialization

Tab 5: Calendar & Availability
- Monthly calendar view
- Click dates to block/unblock them
- Option to block by service or entire hotel
- Bulk block: select date range

Tab 6: Policies
- Cancellation policy dropdown
- Custom house rules (textarea)

All changes auto-save with a 2-second debounce (optimistic updates). Show save status ("Saving...", "Saved", "Error").

Expected output: full-featured listing editor backed by updateHotel() and related server actions.
```

---

### TASK 2.3 — Operator Dashboard (Overview)

**Agent Prompt:**
```
Create the operator dashboard overview page at:
src/app/(operator)/dashboard/page.tsx

Sections:

1. Stats Row (4 cards):
   - Upcoming bookings (count, next 30 days)
   - This month revenue (sum of confirmed bookings this month)
   - Average rating (from reviews)
   - Total reviews count

2. Upcoming Bookings (next 7 days):
   - List of bookings with: pet name, owner name, service, dates, status badge
   - "View" link to booking detail

3. Pending Actions:
   - Unread messages count (with link)
   - Listing status (if still 'pending', show review status alert)

4. Quick Links:
   - "Edit Listing", "Manage Availability", "View Reviews"

Fetch all data via Supabase queries inside React Server Component.
Use recharts BarChart to show bookings per day for the next 14 days.

Expected output: informative, data-driven operator dashboard.
```

---

## SPRINT 3 — Search & Discovery (Weeks 5–6)

**Goal:** Pet owners can search for hotels and view detailed listings.

---

### TASK 3.1 — Search Page

**Agent Prompt:**
```
Build the hotel search page at src/app/(public)/search/page.tsx (SSR).

Search bar at top (sticky on scroll):
- Location input: city text field with Google Places Autocomplete (cities only)
- Date range picker: check-in / check-out using react-day-picker
- Pet type dropdown: Dog / Cat / Bird / Rabbit / Small Animal / Reptile / Other
- Service type dropdown: Overnight Boarding / Day Care / Grooming / Training / All
- "Search" button

Results area (left: list, right: map toggle):

List view:
- Hotel cards — each shows:
  - Cover photo (next/image optimized)
  - Hotel name
  - City, address
  - Rating (star icons) + review count
  - Accepted species icons (small paw icons colored by species)
  - "From $XX / night" pricing
  - Amenity pills (first 3)
  - "View Details" button
- Show 20 results per page with pagination

Filters sidebar (desktop) / bottom sheet (mobile):
- Price range slider (min/max per night)
- Minimum rating filter (1–5 stars)
- Amenities multi-select checkboxes
- Sort by: Relevance | Price ↑ | Price ↓ | Rating

Map view toggle:
- Google Maps showing pins for each result
- Clicking a pin shows hotel card popup
- Map and list are synchronized

Implement searchHotels() query in src/lib/queries/hotels.ts using Supabase.
Pass search params as URL search params (shareable/bookmarkable URLs).

Loading: show HotelCardSkeleton while fetching.
Empty state: "No pet hotels found in [city]. Try expanding your search."

Expected output: fully functional, SEO-friendly search page.
```

---

### TASK 3.2 — Hotel Detail Page

**Agent Prompt:**
```
Build the hotel detail page at src/app/(public)/hotels/[slug]/page.tsx (SSR + ISR, revalidate 60s).

Sections (in order):

1. Hero — full-width photo gallery (main photo + 4 thumbnails, click to open lightbox)

2. Header — name, city, rating stars, review count, "Save to favorites" heart button (auth required)

3. Overview — description, amenities grid with icons

4. Accepted Pets — species badges with icons

5. Services — cards for each active service:
   - Service name, icon, description
   - Price (formatted: "$45 / night")
   - Max capacity, accepted species, weight limit
   - "Book This Service" button (anchors to booking CTA)

6. Availability Calendar — read-only monthly calendar showing blocked (red) and available (green) dates

7. Location — static Google Map embed + full address

8. Reviews — list of reviews with:
   - Star rating breakdown (overall + sub-ratings)
   - Review body + photo (if any)
   - Owner avatar, first name
   - Operator reply (if any)
   - "Load more" pagination (10 per page)

9. Sticky Booking CTA (bottom of page on mobile, right sidebar on desktop):
   - Date picker
   - Pet selector (dropdown of owner's pets or "Add a pet")
   - Service selector
   - Price summary
   - "Book Now" button → /book/[hotelId] with params

Add JSON-LD structured data (LocalBusiness schema) for SEO.
Generate dynamic OG image via /api/og.

Expected output: rich, SEO-optimized hotel detail page.
```

---

### TASK 3.3 — Pet Profiles Management

**Agent Prompt:**
```
Build the pet profiles management page at src/app/(owner)/pets/page.tsx.

Page content:
1. Grid of existing pet cards — each shows:
   - Pet photo (or species icon placeholder)
   - Name, species, breed
   - Age, weight
   - Vaccination badge (green check or red "unverified")
   - "Edit" and "Delete" buttons

2. "Add New Pet" button → opens a drawer/modal with PetForm

PetForm component (src/components/forms/PetForm.tsx):
- Name (required)
- Species (required) — dropdown with species icons
- Breed (text, optional)
- Age in years (number, optional)
- Weight in kg (number, optional)
- Photo upload (to Supabase Storage pet-photos bucket)
- Vaccinated checkbox
- Vaccination document upload (PDF/image, to documents bucket)
- Special needs (textarea)
- Emergency vet contact (text)
- Emergency personal contact (text)

Implement:
- createPet() server action
- updatePet() server action
- deletePet() server action (soft delete: is_active = false)
- uploadVaccinationDoc() server action

Show toast notifications on success/error.

Expected output: complete pet CRUD with file uploads working.
```

---

## SPRINT 4 — Booking Flow & Payments (Weeks 7–8)

**Goal:** Pet owners can complete a booking end-to-end including payment.

---

### TASK 4.1 — Booking Flow UI

**Agent Prompt:**
```
Build the 3-step booking flow.

Route: src/app/(owner)/book/[hotelId]/page.tsx

Step 1 — Select Service & Dates:
- Pre-populated from search params (hotelId, serviceId, checkin, checkout, petIds)
- Show hotel name + cover photo
- Service selector (if not pre-selected)
- Date range picker (disabled blocked dates from availability API)
- Pet selector: checkboxes of owner's active pets
  - If no pets: "Add a pet first" with link to /owner/pets
  - Show species compatibility warning if selected pet species not accepted by service

Step 2 — Review Booking:
- Full booking summary:
  - Hotel name + service name
  - Check-in / Check-out dates
  - Number of nights
  - Selected pets (name + species)
  - Price breakdown:
    - Base: $X × Y nights = $Z
    - Platform fee (10%): $A
    - Total: $B
  - Cancellation policy (highlighted box)
  - Special requests textarea

Step 3 — Payment:
- "Proceed to Payment" button calls initiateBooking() server action
- On success: redirect to Stripe Checkout URL
- Show spinner during API call
- On Stripe return:
  - Success URL: /owner/bookings/confirmation?session_id={CHECKOUT_SESSION_ID}
  - Cancel URL: back to step 2

Create src/app/(owner)/bookings/confirmation/page.tsx:
- Fetch booking from DB using session_id (passed via URL)
- Show: "Booking Confirmed! 🐾"
- Booking details summary
- "View My Bookings" and "Back to Home" CTAs
- Confetti animation (canvas-confetti)

Expected output: complete 3-step booking flow connected to Stripe.
```

---

### TASK 4.2 — Stripe Integration

**Agent Prompt:**
```
Implement full Stripe payment integration for PawStay.

1. src/lib/stripe/client.ts:
   - Initialize Stripe client with secret key
   - Export typed stripe instance

2. src/actions/bookings.ts — implement initiateBooking():
   - Validate input with Zod
   - Check auth (must be pet_owner)
   - Verify hotel is active and service exists
   - Check no date conflicts (query blocked dates and existing confirmed bookings)
   - Calculate: subtotal, platform_fee (10%), total
   - Create Stripe Checkout Session:
     - mode: 'payment'
     - line_items: service name + nights breakdown
     - application_fee_amount: platform fee in cents
     - transfer_data.destination: hotel's stripe_account_id
     - metadata: { hotelId, serviceId, ownerId, checkinDate, checkoutDate, petIds }
     - success_url, cancel_url
   - Return { checkoutUrl }

3. src/app/api/webhooks/stripe/route.ts:
   - Verify Stripe signature
   - Handle checkout.session.completed:
     a. Extract metadata from session
     b. Create bookings record (status: 'confirmed')
     c. Create booking_pets records
     d. Call send-booking-confirmation edge function (or Resend directly)
   - Handle payment_intent.payment_failed:
     a. Log failed attempt (don't create booking)

4. Stripe Connect for operators:
   - Add "Connect Stripe" button in operator settings
   - src/actions/hotels.ts — createStripeConnectAccount():
     - Create Stripe Express account
     - Generate account link URL
     - Store stripe_account_id in hotels table
   - Operator settings page shows Connect status

5. src/lib/stripe/webhooks.ts — typed webhook event handlers

Expected output: end-to-end payment flow working in test mode with Stripe test cards.
```

---

### TASK 4.3 — Bookings Management (Pet Owner)

**Agent Prompt:**
```
Build the bookings management section for pet owners.

Route: src/app/(owner)/bookings/page.tsx

Tabs: "Upcoming" | "Past" | "Cancelled"

Each booking card shows:
- Hotel cover photo (small)
- Hotel name + service name
- Check-in / Check-out dates
- Pets included (names + species icons)
- Status badge (color-coded)
- Total paid
- Actions:
  - Upcoming: "View Details", "Cancel Booking" (if within cancellation window)
  - Past (completed, no review): "Leave a Review" button
  - Past (with review): "View Review"
  - Cancelled: "Book Again" link

Route: src/app/(owner)/bookings/[bookingId]/page.tsx — booking detail:
- Full booking info
- Hotel contact (phone, email)
- Cancellation policy reminder
- "Cancel Booking" button with confirmation dialog (shows refund amount based on policy)

Implement cancelBooking() server action:
- Check cancellation is allowed (status is 'confirmed')
- Calculate refund amount based on hotel's cancellation policy and days until check-in
- Issue Stripe refund via stripe.refunds.create()
- Update booking status to 'cancelled'
- Send cancellation email to both parties

Expected output: complete booking management with working cancellation and Stripe refunds.
```

---

## SPRINT 5 — Reviews & Messaging (Weeks 9–10)

**Goal:** Reviews and in-app messaging working end-to-end.

---

### TASK 5.1 — Reviews System

**Agent Prompt:**
```
Implement the full reviews system for PawStay.

1. Review submission flow:
   - After a booking status becomes 'completed', send a review request email (via Resend)
     24 hours after checkout date using a Supabase Edge Function or cron.
   - Route: src/app/(owner)/bookings/[bookingId]/review/page.tsx
     - Only accessible if booking status = 'completed' AND no existing review for this booking
     - Star rating component (overall + cleanliness, staff, safety, value breakdown)
     - Text review textarea (min 50 chars with character counter)
     - Optional photo upload
     - Submit calls createReview() server action

2. Reviews display on hotel detail page:
   - Already built in TASK 3.2, but ensure:
     - Sub-rating bars (visual progress bars for cleanliness, staff, safety, value)
     - "X out of 5 based on Y reviews" summary
     - Rating distribution histogram (5★ N%, 4★ N%, etc.)

3. Operator review management:
   - Route: src/app/(operator)/reviews/page.tsx
   - List all reviews for operator's hotel(s)
   - For each review without a reply: "Reply" button opens inline textarea
   - Implement replyToReview() server action
   - Show replied/pending reply status

4. Admin review moderation:
   - Route: src/app/(admin)/reviews/page.tsx
   - Flagged reviews queue
   - "Remove" and "Approve" actions

Expected output: complete review lifecycle from submission to display to operator reply.
```

---

### TASK 5.2 — In-App Messaging

**Agent Prompt:**
```
Build the in-app messaging system using Supabase Realtime.

1. Conversations list:
   - src/app/(owner)/messages/page.tsx — list of owner's conversations
   - src/app/(operator)/messages/page.tsx — list of operator's conversations
   - Each item: other party avatar + name, hotel name, last message preview, timestamp, unread badge

2. Conversation view:
   - src/app/(owner)/messages/[conversationId]/page.tsx
   - src/app/(operator)/messages/[conversationId]/page.tsx
   - Chat bubble UI (my messages right, theirs left)
   - Message input + send button
   - "Booking context" banner at top (if conversation linked to a booking)
   - Real-time updates via Supabase Realtime channel subscription

3. Start conversation:
   - "Contact Hotel" button on hotel detail page (only for authenticated pet owners)
   - Creates or retrieves existing conversation via getOrCreateConversation()
   - Pre-booking inquiries: 1 message allowed before booking confirmed
   - After booking confirmed: unlimited messages

4. Server actions in src/actions/messages.ts:
   - getOrCreateConversation()
   - sendMessage()
   - markMessagesRead()

5. Notifications:
   - Email notification (via Resend) when a new message is received and recipient is offline
   - Unread message count badge in Header nav (real-time via Supabase channel)

Expected output: real-time messaging with email notifications and unread badges.
```

---

## SPRINT 6 — Dashboards & Admin (Weeks 11–12)

**Goal:** Complete dashboards for all roles, plus admin panel.

---

### TASK 6.1 — Operator Bookings & Calendar

**Agent Prompt:**
```
Build the operator bookings and calendar sections.

1. src/app/(operator)/bookings/page.tsx:
   - Filter tabs: All | Pending | Confirmed | Active | Completed | Cancelled
   - Date range filter
   - Search by owner name or pet name
   - Booking rows with: owner name, pet(s), service, dates, total, status badge
   - Actions: "Confirm" (if pending), "Check In", "Check Out", "View Details"
   - Bulk actions: "Confirm selected", "Export CSV"

2. src/app/(operator)/bookings/[bookingId]/page.tsx — booking detail:
   - Full booking details
   - Pet medical info (vaccination status, special needs)
   - Emergency contacts
   - Status action buttons
   - Message thread for this booking

3. src/app/(operator)/calendar/page.tsx:
   - Month view calendar showing all bookings as colored blocks
   - Color by service type
   - Click booking block → booking detail popover
   - Click empty date → block/unblock date modal
   - Week view toggle
   - Legend

Expected output: full booking management interface for operators.
```

---

### TASK 6.2 — Operator Revenue & Settings

**Agent Prompt:**
```
Build operator settings and revenue sections.

1. src/app/(operator)/settings/page.tsx — tabs:
   Tab "Account": update name, email, phone, password
   Tab "Payments": Stripe Connect status + "Connect / Reconnect" button, payout schedule info
   Tab "Notifications": email notification toggles (new booking, new message, new review)

2. Add to operator dashboard (src/app/(operator)/dashboard/page.tsx):
   Revenue section:
   - Monthly revenue chart (recharts LineChart) — last 6 months
   - This month: total revenue, pending payouts, completed bookings
   - Revenue breakdown table by service type

Expected output: complete settings and revenue tracking for operators.
```

---

### TASK 6.3 — Admin Panel

**Agent Prompt:**
```
Build the admin panel at src/app/(admin)/.

Only accessible to users with role = 'admin'. Middleware already protects this route.

1. src/app/(admin)/dashboard/page.tsx — metrics:
   - Total hotels (active, pending, suspended)
   - Total users (owners, operators)
   - Total bookings (all time + this month)
   - Platform revenue (sum of platform fees, all time + this month)
   - 4 time-series charts (recharts): bookings/day, revenue/day, new users/day, new hotels/day

2. src/app/(admin)/hotels/page.tsx:
   - Tab: "Pending Review" | "Active" | "Suspended"
   - Hotel row: name, operator name, city, created date, services count
   - Pending: "Approve" and "Reject" buttons (reject requires reason text)
   - Active: "Suspend" button
   - Implement updateHotelStatus() admin action

3. src/app/(admin)/users/page.tsx:
   - Search users by name or email
   - Filter by role
   - User row: name, email, role, signup date, booking count
   - Actions: "View", "Suspend", "Delete account" (confirmation required)

4. src/app/(admin)/bookings/page.tsx:
   - All bookings across platform
   - Filter by status, date range, hotel, owner
   - Export to CSV

Expected output: functional admin panel for platform management.
```

---

## SPRINT 7 — Favorites, SEO & Polish (Weeks 13–14)

**Goal:** Final features, performance, SEO, and launch readiness.

---

### TASK 7.1 — Favorites Feature

**Agent Prompt:**
```
Implement the hotel favorites (saved hotels) feature.

1. Heart button on hotel cards and hotel detail page:
   - If unauthenticated: clicking redirects to /login with returnUrl
   - If authenticated: toggles favorite (optimistic update)
   - Filled heart = saved, outline heart = not saved
   - Server action: toggleFavorite(hotelId) in src/actions/favorites.ts

2. src/app/(owner)/favorites/page.tsx:
   - Grid of saved hotel cards (same component as search results)
   - "Remove from favorites" button on each card
   - Empty state: "You haven't saved any hotels yet. Start exploring!"

Expected output: complete favorites feature with optimistic UI updates.
```

---

### TASK 7.2 — SEO & Performance

**Agent Prompt:**
```
Implement SEO and performance optimizations for PawStay.

1. Metadata:
   - Dynamic metadata in src/app/(public)/hotels/[slug]/page.tsx:
     title: "${hotel.name} - Pet Hotel in ${hotel.city} | PawStay"
     description: hotel.description (truncated to 160 chars)
     openGraph: { title, description, images: [hotel.coverPhotoUrl] }
   - Static metadata for homepage, search page
   - robots.ts: allow all except /admin, /api
   - sitemap.ts: generate URLs for all active hotels (ISR)

2. Structured Data:
   - LocalBusiness JSON-LD on hotel detail page (already planned in TASK 3.2)
   - Product JSON-LD for each service
   - BreadcrumbList JSON-LD

3. Performance:
   - Audit all images: ensure next/image with proper sizes
   - Add loading="lazy" to below-fold images
   - Add Suspense boundaries around async components
   - Verify Core Web Vitals with Lighthouse (target: all green)
   - Add skeleton loaders for all async sections

4. src/app/(public)/page.tsx — update homepage:
   - Add city quick-links section (popular cities)
   - Add species quick-links section (Find care for your Dog / Cat / Bird...)
   - Each links to /search with pre-filled params

Expected output: Lighthouse score ≥ 90 on mobile and desktop.
```

---

### TASK 7.3 — Email Templates

**Agent Prompt:**
```
Implement all transactional email templates using React Email and Resend.

Set up React Email: install @react-email/components react-email resend

Create templates in src/emails/:
1. WelcomeEmail.tsx — sent after signup
2. BookingConfirmationEmail.tsx — sent to pet owner after payment
   - Booking ID, hotel name, dates, pets, total paid, cancellation policy
3. NewBookingAlertEmail.tsx — sent to operator
   - Same info + owner contact details
4. BookingCancelledEmail.tsx — sent to both parties
   - What was cancelled + refund amount (if any)
5. NewMessageEmail.tsx — sent when offline recipient receives message
6. ReviewRequestEmail.tsx — sent 24h after checkout
7. ListingApprovedEmail.tsx — sent when admin approves a listing

Create src/lib/resend/emails.ts:
- sendWelcomeEmail(to, name)
- sendBookingConfirmation(to, booking)
- sendNewBookingAlert(to, booking)
- sendBookingCancelled(to, booking, refundAmount)
- sendNewMessage(to, from, preview)
- sendReviewRequest(to, booking)
- sendListingApproved(to, hotelName)

Preview all emails at /email-preview (dev only, using React Email preview server).

Expected output: all 7 email templates working and sending via Resend.
```

---

### TASK 7.4 — Error Handling & Final QA

**Agent Prompt:**
```
Implement comprehensive error handling and run final quality checks for PawStay.

1. Global error handling:
   - src/app/error.tsx — global error boundary
   - src/app/not-found.tsx — branded 404 page
   - src/app/loading.tsx — global loading fallback

2. Form error handling:
   - All Server Actions must return typed errors
   - Display field-level errors in all forms
   - Network error toast: "Something went wrong. Please try again."

3. Edge cases to handle:
   - Booking: dates already taken by another booking (race condition)
   - Review: user tries to submit twice (unique constraint on booking_id)
   - Search: no Google Maps API key (fallback to text-only view)
   - Payment: Stripe account not connected for operator (block booking with clear message)

4. Security audit:
   - Verify all server actions check auth.uid() before DB operations
   - Verify all Supabase queries go through RLS (never use service role on client)
   - Check that hotel slug cannot be enumerated to find draft/pending listings
   - Validate all user-supplied data with Zod before insertion

5. Accessibility:
   - Run axe DevTools audit on: homepage, search, hotel detail, booking flow
   - Fix: missing aria-labels, focus traps in modals, keyboard navigation
   - Ensure color contrast ratios meet WCAG 2.1 AA

6. Final checklist:
   - [ ] All env vars documented in .env.example
   - [ ] Database migrations idempotent and tested
   - [ ] Stripe in live mode tested with real card (not test mode)
   - [ ] Resend sending from verified domain
   - [ ] Vercel deployment succeeds with zero errors
   - [ ] All RLS policies verified with psql test queries

Expected output: production-ready app passing security, accessibility, and functional QA.
```
