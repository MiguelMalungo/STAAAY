# PawStay — Database Schema (Supabase / PostgreSQL)

**Version:** 1.0
**Date:** February 2026

All tables live in the `public` schema unless otherwise noted. Row Level Security (RLS) is enabled on every table.

---

## 1. ENUMS

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('pet_owner', 'hotel_operator', 'admin');

-- Listing status
CREATE TYPE listing_status AS ENUM ('draft', 'pending', 'active', 'suspended');

-- Booking status
CREATE TYPE booking_status AS ENUM (
  'pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show'
);

-- Service types
CREATE TYPE service_type AS ENUM (
  'overnight_boarding', 'day_care', 'grooming', 'training',
  'vet_consultation', 'solo_walking'
);

-- Pet species
CREATE TYPE pet_species AS ENUM (
  'dog', 'cat', 'bird', 'rabbit', 'small_animal', 'reptile', 'other'
);

-- Cancellation policy
CREATE TYPE cancellation_policy AS ENUM ('flexible', 'moderate', 'strict');

-- Price unit
CREATE TYPE price_unit AS ENUM ('per_night', 'per_session', 'per_hour');
```

---

## 2. CORE TABLES

### 2.1 profiles
Extends `auth.users`. Created automatically via trigger on signup.

```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          user_role NOT NULL DEFAULT 'pet_owner',
  full_name     TEXT,
  avatar_url    TEXT,
  phone         TEXT,
  city          TEXT,
  country       TEXT DEFAULT 'US',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

### 2.2 pets
Pet profiles owned by pet owners.

```sql
CREATE TABLE pets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  species           pet_species NOT NULL,
  breed             TEXT,
  age_years         SMALLINT,
  weight_kg         DECIMAL(5,2),
  photo_url         TEXT,
  vaccinated        BOOLEAN DEFAULT FALSE,
  vaccination_doc_url TEXT,
  special_needs     TEXT,
  emergency_vet     TEXT,
  emergency_contact TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can CRUD their pets"
  ON pets FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Operators can view pets in their bookings"
  ON pets FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM booking_pets bp
      JOIN bookings b ON b.id = bp.booking_id
      JOIN hotels h ON h.id = b.hotel_id
      WHERE bp.pet_id = pets.id AND h.operator_id = auth.uid()
    )
  );
```

---

### 2.3 hotels
Pet hotel listings.

```sql
CREATE TABLE hotels (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug              TEXT UNIQUE NOT NULL,  -- URL-friendly identifier
  name              TEXT NOT NULL,
  description       TEXT,
  address           TEXT NOT NULL,
  city              TEXT NOT NULL,
  state             TEXT,
  country           TEXT DEFAULT 'US',
  zip_code          TEXT,
  latitude          DECIMAL(9,6),
  longitude         DECIMAL(9,6),
  phone             TEXT,
  email             TEXT,
  website           TEXT,
  cover_photo_url   TEXT,
  status            listing_status DEFAULT 'draft',
  cancellation_policy cancellation_policy DEFAULT 'moderate',
  rating            DECIMAL(3,2) DEFAULT 0,
  review_count      INTEGER DEFAULT 0,
  amenities         TEXT[] DEFAULT '{}',   -- ['outdoor_play', 'webcam', '24h_staff', ...]
  accepted_species  pet_species[] DEFAULT '{}',
  stripe_account_id TEXT,                  -- Stripe Connect account
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX hotels_location_idx ON hotels USING GIST (
  ll_to_earth(latitude::float8, longitude::float8)
);
CREATE INDEX hotels_city_idx ON hotels (city);
CREATE INDEX hotels_status_idx ON hotels (status);

-- RLS
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active hotels are publicly readable"
  ON hotels FOR SELECT USING (status = 'active');

CREATE POLICY "Operators can CRUD their hotels"
  ON hotels FOR ALL USING (auth.uid() = operator_id);

CREATE POLICY "Admins can read/update all hotels"
  ON hotels FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

### 2.4 hotel_photos

```sql
CREATE TABLE hotel_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  caption     TEXT,
  is_cover    BOOLEAN DEFAULT FALSE,
  sort_order  SMALLINT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE hotel_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos of active hotels"
  ON hotel_photos FOR SELECT USING (
    EXISTS (SELECT 1 FROM hotels WHERE id = hotel_photos.hotel_id AND status = 'active')
  );

CREATE POLICY "Operators can manage their hotel photos"
  ON hotel_photos FOR ALL USING (
    EXISTS (SELECT 1 FROM hotels WHERE id = hotel_photos.hotel_id AND operator_id = auth.uid())
  );
```

---

### 2.5 hotel_services
Services offered by each hotel.

```sql
CREATE TABLE hotel_services (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id          UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  service_type      service_type NOT NULL,
  name              TEXT NOT NULL,            -- Custom name (e.g. "Luxury Suite Boarding")
  description       TEXT,
  price_cents       INTEGER NOT NULL,         -- Price in smallest currency unit
  currency          CHAR(3) DEFAULT 'USD',
  price_unit        price_unit DEFAULT 'per_night',
  duration_minutes  INTEGER,                  -- For session-based services
  max_capacity      SMALLINT,                 -- Max pets at same time
  accepted_species  pet_species[] DEFAULT '{}',
  max_weight_kg     DECIMAL(5,2),
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE hotel_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view services of active hotels"
  ON hotel_services FOR SELECT USING (
    EXISTS (SELECT 1 FROM hotels WHERE id = hotel_services.hotel_id AND status = 'active')
    AND is_active = TRUE
  );

CREATE POLICY "Operators can manage their services"
  ON hotel_services FOR ALL USING (
    EXISTS (SELECT 1 FROM hotels WHERE id = hotel_services.hotel_id AND operator_id = auth.uid())
  );
```

---

### 2.6 hotel_availability
Blocked dates (when hotel/service is unavailable).

```sql
CREATE TABLE hotel_availability (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  service_id  UUID REFERENCES hotel_services(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,               -- A single blocked date
  reason      TEXT,                         -- 'holiday', 'maintenance', etc.
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX availability_hotel_date_idx ON hotel_availability (hotel_id, blocked_date);

-- RLS
ALTER TABLE hotel_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read availability"
  ON hotel_availability FOR SELECT USING (TRUE);

CREATE POLICY "Operators can manage their availability"
  ON hotel_availability FOR ALL USING (
    EXISTS (SELECT 1 FROM hotels WHERE id = hotel_availability.hotel_id AND operator_id = auth.uid())
  );
```

---

## 3. BOOKING TABLES

### 3.1 bookings

```sql
CREATE TABLE bookings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id              UUID NOT NULL REFERENCES hotels(id),
  owner_id              UUID NOT NULL REFERENCES profiles(id),
  service_id            UUID NOT NULL REFERENCES hotel_services(id),
  status                booking_status DEFAULT 'pending',
  checkin_date          DATE NOT NULL,
  checkout_date         DATE NOT NULL,
  nights                SMALLINT GENERATED ALWAYS AS (
                          CASE WHEN checkout_date > checkin_date
                          THEN (checkout_date - checkin_date)
                          ELSE 1 END
                        ) STORED,
  subtotal_cents        INTEGER NOT NULL,
  platform_fee_cents    INTEGER NOT NULL,    -- 10% of subtotal
  total_cents           INTEGER NOT NULL,    -- subtotal + platform fee
  currency              CHAR(3) DEFAULT 'USD',
  special_requests      TEXT,
  stripe_session_id     TEXT,               -- Stripe Checkout Session ID
  stripe_payment_intent TEXT,
  operator_payout_id    TEXT,               -- Stripe transfer ID
  cancelled_by          UUID REFERENCES profiles(id),
  cancelled_at          TIMESTAMPTZ,
  cancel_reason         TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX bookings_owner_idx ON bookings (owner_id);
CREATE INDEX bookings_hotel_idx ON bookings (hotel_id);
CREATE INDEX bookings_status_idx ON bookings (status);
CREATE INDEX bookings_dates_idx ON bookings (checkin_date, checkout_date);

-- RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their bookings"
  ON bookings FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Operators can view bookings for their hotels"
  ON bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM hotels WHERE id = bookings.hotel_id AND operator_id = auth.uid())
  );

CREATE POLICY "Owners can create bookings"
  ON bookings FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners and operators can update bookings"
  ON bookings FOR UPDATE USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM hotels WHERE id = bookings.hotel_id AND operator_id = auth.uid())
  );

CREATE POLICY "Admins have full access"
  ON bookings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

### 3.2 booking_pets
Pets included in a booking (many-to-many).

```sql
CREATE TABLE booking_pets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  pet_id      UUID NOT NULL REFERENCES pets(id),
  UNIQUE (booking_id, pet_id)
);

-- RLS
ALTER TABLE booking_pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booking participants can view booking pets"
  ON booking_pets FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_pets.booking_id
      AND (
        b.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM hotels h WHERE h.id = b.hotel_id AND h.operator_id = auth.uid())
      )
    )
  );
```

---

## 4. REVIEWS

```sql
CREATE TABLE reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        UUID NOT NULL UNIQUE REFERENCES bookings(id),
  hotel_id          UUID NOT NULL REFERENCES hotels(id),
  owner_id          UUID NOT NULL REFERENCES profiles(id),
  overall_rating    SMALLINT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  cleanliness       SMALLINT CHECK (cleanliness BETWEEN 1 AND 5),
  staff             SMALLINT CHECK (staff BETWEEN 1 AND 5),
  safety            SMALLINT CHECK (safety BETWEEN 1 AND 5),
  value             SMALLINT CHECK (value BETWEEN 1 AND 5),
  body              TEXT NOT NULL CHECK (LENGTH(body) >= 50),
  photo_url         TEXT,
  operator_reply    TEXT,
  operator_reply_at TIMESTAMPTZ,
  is_flagged        BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX reviews_hotel_idx ON reviews (hotel_id);

-- Trigger: update hotel rating on review insert/update/delete
CREATE OR REPLACE FUNCTION update_hotel_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE hotels SET
    rating = (
      SELECT ROUND(AVG(overall_rating)::numeric, 2)
      FROM reviews WHERE hotel_id = NEW.hotel_id AND is_flagged = FALSE
    ),
    review_count = (
      SELECT COUNT(*) FROM reviews
      WHERE hotel_id = NEW.hotel_id AND is_flagged = FALSE
    )
  WHERE id = NEW.hotel_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_hotel_rating();

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read non-flagged reviews"
  ON reviews FOR SELECT USING (is_flagged = FALSE);

CREATE POLICY "Owners can write reviews for their completed bookings"
  ON reviews FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = reviews.booking_id
      AND owner_id = auth.uid()
      AND status = 'completed'
    )
  );

CREATE POLICY "Operators can add reply to reviews of their hotels"
  ON reviews FOR UPDATE USING (
    EXISTS (SELECT 1 FROM hotels WHERE id = reviews.hotel_id AND operator_id = auth.uid())
  );
```

---

## 5. MESSAGING

### 5.1 conversations

```sql
CREATE TABLE conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    UUID REFERENCES bookings(id) ON DELETE SET NULL,
  hotel_id      UUID NOT NULL REFERENCES hotels(id),
  owner_id      UUID NOT NULL REFERENCES profiles(id),
  last_message  TEXT,
  last_message_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view conversations"
  ON conversations FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM hotels WHERE id = conversations.hotel_id AND operator_id = auth.uid())
  );
```

---

### 5.2 messages

```sql
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id),
  body            TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX messages_conversation_idx ON messages (conversation_id, created_at DESC);

-- RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can view messages"
  ON messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM hotels h WHERE h.id = c.hotel_id AND h.operator_id = auth.uid())
      )
    )
  );

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        c.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM hotels h WHERE h.id = c.hotel_id AND h.operator_id = auth.uid())
      )
    )
  );
```

---

## 6. FAVORITES

```sql
CREATE TABLE favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hotel_id    UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (owner_id, hotel_id)
);

-- RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their own favorites"
  ON favorites FOR ALL USING (auth.uid() = owner_id);
```

---

## 7. INDEXES SUMMARY

```sql
-- Performance-critical indexes (beyond PKs)
CREATE INDEX idx_hotels_operator      ON hotels (operator_id);
CREATE INDEX idx_hotels_city_status   ON hotels (city, status);
CREATE INDEX idx_bookings_dates       ON bookings (checkin_date, checkout_date);
CREATE INDEX idx_reviews_hotel        ON reviews (hotel_id, created_at DESC);
CREATE INDEX idx_messages_conv        ON messages (conversation_id, created_at DESC);
CREATE INDEX idx_pets_owner           ON pets (owner_id);
```

---

## 8. STORAGE BUCKET POLICIES

```sql
-- hotel-photos bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-photos', 'hotel-photos', TRUE);

CREATE POLICY "Anyone can view hotel photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hotel-photos');

CREATE POLICY "Operators can upload hotel photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'hotel-photos' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'hotel_operator'
    )
  );

-- pet-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', FALSE);

CREATE POLICY "Owners can manage their pet photos"
  ON storage.objects FOR ALL
  USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- documents bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', FALSE);

CREATE POLICY "Users can manage their own documents"
  ON storage.objects FOR ALL
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```
