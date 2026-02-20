# PawStay — API Design

**Version:** 1.0
**Date:** February 2026

PawStay uses **Next.js Server Actions** for all mutations (create, update, delete) and **direct Supabase queries** inside React Server Components for data fetching. Traditional REST API routes are reserved only for external webhook receivers.

---

## 1. HTTP API Routes (Next.js Route Handlers)

These are the only true HTTP endpoints exposed by the app:

### POST `/api/webhooks/stripe`

Handles all Stripe webhook events. Stripe signs every request; signature is verified before processing.

**Headers:**
```
stripe-signature: <webhook_signature>
Content-Type: application/json
```

**Events handled:**

| Stripe Event | Action |
|-------------|--------|
| `checkout.session.completed` | Create booking, send confirmation emails |
| `payment_intent.payment_failed` | Mark booking as failed, notify owner |
| `account.updated` | Sync operator Stripe Connect status |
| `transfer.created` | Record operator payout in DB |

**Response:** `200 OK` (always, to acknowledge receipt; errors logged internally)

---

### GET `/api/og`

Generates Open Graph images for hotel listing pages (dynamic social previews).

**Query Params:**
```
?name=HotelName&rating=4.5&photo=<url>
```

**Response:** `image/png` — 1200×630px OG image

---

## 2. Server Actions

All mutations are implemented as Server Actions in `src/actions/`. They run on the server, are type-safe, and include Zod validation before any DB operation.

**Convention:**
- Actions return `{ data, error }` objects
- Error shape: `{ code: string, message: string, field?: string }`
- Authentication is always checked first via `getAuthUser()`

---

### 2.1 Auth Actions (`actions/auth.ts`)

```typescript
// Sign up with email/password
signUp(input: {
  email: string
  password: string
  fullName: string
  role: 'pet_owner' | 'hotel_operator'
}): Promise<{ data: { userId: string } | null, error: ActionError | null }>

// Sign in
signIn(input: {
  email: string
  password: string
}): Promise<{ data: { userId: string } | null, error: ActionError | null }>

// Sign out
signOut(): Promise<void>

// Complete onboarding
completeOnboarding(input: {
  city: string
  phone?: string
}): Promise<{ data: Profile | null, error: ActionError | null }>
```

---

### 2.2 Pet Actions (`actions/pets.ts`)

```typescript
// Create a pet profile
createPet(input: {
  name: string
  species: PetSpecies
  breed?: string
  ageYears?: number
  weightKg?: number
  vaccinated?: boolean
  specialNeeds?: string
  emergencyContact?: string
}): Promise<{ data: Pet | null, error: ActionError | null }>

// Update pet
updatePet(input: {
  id: string
  name?: string
  species?: PetSpecies
  breed?: string
  ageYears?: number
  weightKg?: number
  vaccinated?: boolean
  specialNeeds?: string
  photoUrl?: string
}): Promise<{ data: Pet | null, error: ActionError | null }>

// Delete (soft-delete) pet
deletePet(id: string): Promise<{ error: ActionError | null }>

// Upload vaccination document
uploadVaccinationDoc(input: {
  petId: string
  file: File
}): Promise<{ data: { url: string } | null, error: ActionError | null }>
```

---

### 2.3 Hotel Actions (`actions/hotels.ts`)

```typescript
// Create hotel listing (operator only)
createHotel(input: {
  name: string
  description: string
  address: string
  city: string
  state?: string
  country: string
  zipCode?: string
  phone?: string
  email?: string
  cancellationPolicy: CancellationPolicy
  acceptedSpecies: PetSpecies[]
  amenities: string[]
}): Promise<{ data: Hotel | null, error: ActionError | null }>

// Update hotel
updateHotel(input: {
  id: string
  [field: string]: any
}): Promise<{ data: Hotel | null, error: ActionError | null }>

// Submit listing for review
submitHotelForReview(hotelId: string): Promise<{ error: ActionError | null }>

// Admin: approve or reject listing
updateHotelStatus(input: {
  hotelId: string
  status: 'active' | 'suspended'
  reason?: string
}): Promise<{ error: ActionError | null }>

// Add service to hotel
createHotelService(input: {
  hotelId: string
  serviceType: ServiceType
  name: string
  description?: string
  priceCents: number
  priceUnit: PriceUnit
  durationMinutes?: number
  maxCapacity?: number
  acceptedSpecies: PetSpecies[]
  maxWeightKg?: number
}): Promise<{ data: HotelService | null, error: ActionError | null }>

// Update service
updateHotelService(input: {
  id: string
  [field: string]: any
}): Promise<{ data: HotelService | null, error: ActionError | null }>

// Block dates on hotel calendar
blockDates(input: {
  hotelId: string
  serviceId?: string
  dates: string[]      // ISO date strings
  reason?: string
}): Promise<{ error: ActionError | null }>

// Unblock dates
unblockDates(input: {
  hotelId: string
  dates: string[]
}): Promise<{ error: ActionError | null }>
```

---

### 2.4 Search Actions / Queries (`lib/queries/hotels.ts`)

These are not Server Actions but typed query functions called inside RSCs:

```typescript
// Search hotels
searchHotels(params: {
  city?: string
  latitude?: number
  longitude?: number
  radiusKm?: number
  checkinDate: string
  checkoutDate: string
  species?: PetSpecies
  serviceType?: ServiceType
  minRating?: number
  maxPriceCents?: number
  amenities?: string[]
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating'
  page?: number
  limit?: number
}): Promise<{ hotels: HotelSearchResult[], total: number }>

// Get hotel detail by slug
getHotelBySlug(slug: string): Promise<HotelDetail | null>

// Get hotel services + availability for date range
getHotelAvailability(input: {
  hotelId: string
  checkinDate: string
  checkoutDate: string
}): Promise<{ services: HotelService[], blockedDates: string[] }>
```

---

### 2.5 Booking Actions (`actions/bookings.ts`)

```typescript
// Create Stripe Checkout session (step 1 of booking)
initiateBooking(input: {
  hotelId: string
  serviceId: string
  checkinDate: string
  checkoutDate: string
  petIds: string[]
  specialRequests?: string
}): Promise<{ data: { checkoutUrl: string } | null, error: ActionError | null }>
// Note: actual booking record is created by Stripe webhook on payment success

// Cancel booking (owner or operator)
cancelBooking(input: {
  bookingId: string
  reason?: string
}): Promise<{ error: ActionError | null }>

// Operator: mark booking as active (pet checked in)
checkInBooking(bookingId: string): Promise<{ error: ActionError | null }>

// Operator: mark booking as completed (pet checked out)
checkOutBooking(bookingId: string): Promise<{ error: ActionError | null }>
```

---

### 2.6 Review Actions (`actions/reviews.ts`)

```typescript
// Submit review after completed booking
createReview(input: {
  bookingId: string
  overallRating: number    // 1–5
  cleanliness?: number
  staff?: number
  safety?: number
  value?: number
  body: string             // min 50 chars
  photoUrl?: string
}): Promise<{ data: Review | null, error: ActionError | null }>

// Operator reply to review
replyToReview(input: {
  reviewId: string
  reply: string
}): Promise<{ error: ActionError | null }>

// Admin: flag review
flagReview(reviewId: string): Promise<{ error: ActionError | null }>
```

---

### 2.7 Messaging Actions (`actions/messages.ts`)

```typescript
// Start or retrieve conversation
getOrCreateConversation(input: {
  hotelId: string
  bookingId?: string
}): Promise<{ data: Conversation | null, error: ActionError | null }>

// Send message
sendMessage(input: {
  conversationId: string
  body: string
}): Promise<{ data: Message | null, error: ActionError | null }>

// Mark messages as read
markMessagesRead(conversationId: string): Promise<{ error: ActionError | null }>
```

---

## 3. Real-time Subscriptions

Supabase Realtime channels (client-side):

```typescript
// Listen for new messages in a conversation
supabase
  .channel(`conversation:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => handleNewMessage(payload.new))
  .subscribe()

// Operator: listen for new bookings
supabase
  .channel(`hotel-bookings:${hotelId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'bookings',
    filter: `hotel_id=eq.${hotelId}`
  }, (payload) => handleNewBooking(payload.new))
  .subscribe()
```

---

## 4. Type Definitions (`lib/types.ts`)

```typescript
export type UserRole = 'pet_owner' | 'hotel_operator' | 'admin'
export type ListingStatus = 'draft' | 'pending' | 'active' | 'suspended'
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show'
export type ServiceType = 'overnight_boarding' | 'day_care' | 'grooming' | 'training' | 'vet_consultation' | 'solo_walking'
export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'small_animal' | 'reptile' | 'other'
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict'
export type PriceUnit = 'per_night' | 'per_session' | 'per_hour'

export interface ActionError {
  code: string
  message: string
  field?: string
}

export interface Profile {
  id: string
  role: UserRole
  fullName: string | null
  avatarUrl: string | null
  phone: string | null
  city: string | null
  onboardingComplete: boolean
}

export interface Pet {
  id: string
  ownerId: string
  name: string
  species: PetSpecies
  breed: string | null
  ageYears: number | null
  weightKg: number | null
  photoUrl: string | null
  vaccinated: boolean
  specialNeeds: string | null
}

export interface Hotel {
  id: string
  operatorId: string
  slug: string
  name: string
  description: string | null
  address: string
  city: string
  latitude: number | null
  longitude: number | null
  coverPhotoUrl: string | null
  status: ListingStatus
  cancellationPolicy: CancellationPolicy
  rating: number
  reviewCount: number
  amenities: string[]
  acceptedSpecies: PetSpecies[]
}

export interface HotelService {
  id: string
  hotelId: string
  serviceType: ServiceType
  name: string
  description: string | null
  priceCents: number
  currency: string
  priceUnit: PriceUnit
  durationMinutes: number | null
  maxCapacity: number | null
  acceptedSpecies: PetSpecies[]
  maxWeightKg: number | null
  isActive: boolean
}

export interface Booking {
  id: string
  hotelId: string
  ownerId: string
  serviceId: string
  status: BookingStatus
  checkinDate: string
  checkoutDate: string
  nights: number
  subtotalCents: number
  platformFeeCents: number
  totalCents: number
  currency: string
  specialRequests: string | null
  createdAt: string
}

export interface Review {
  id: string
  bookingId: string
  hotelId: string
  ownerId: string
  overallRating: number
  cleanliness: number | null
  staff: number | null
  safety: number | null
  value: number | null
  body: string
  photoUrl: string | null
  operatorReply: string | null
  createdAt: string
}
```
