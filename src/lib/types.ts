// ─── Enums ────────────────────────────────────────────────────────────────────
export type PetSpecies = "dog" | "cat" | "bird" | "rabbit" | "small_animal" | "reptile" | "other";
export type ServiceType = "overnight_boarding" | "day_care" | "grooming" | "training" | "vet_consultation" | "solo_walking";
export type PriceUnit = "per_night" | "per_session" | "per_hour";
export type ListingStatus = "draft" | "pending" | "active" | "suspended";

// ─── Search ───────────────────────────────────────────────────────────────────
export interface Place {
  placeId: string;
  displayName: string;
  formattedAddress: string;
}

export interface SearchParams {
  checkin: string;
  checkout: string;
  city?: string;
  placeId?: string;
  placeName?: string;
  petType?: PetSpecies;
  serviceType?: ServiceType;
}

// ─── Hotel ────────────────────────────────────────────────────────────────────
export interface HotelService {
  id: string;
  serviceType: ServiceType;
  name: string;
  description?: string;
  priceCents: number;
  currency: string;
  priceUnit: PriceUnit;
  durationMinutes?: number;
  maxCapacity?: number;
  acceptedSpecies: PetSpecies[];
  maxWeightKg?: number;
}

export interface HotelBrief {
  id: string;
  slug: string;
  name: string;
  coverPhoto: string;
  city: string;
  country: string;
  address: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  acceptedSpecies: PetSpecies[];
  services: HotelService[];
  tags?: string[];
}

export interface HotelDetail extends HotelBrief {
  description: string;
  photos: string[];
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  cancellationPolicy: "flexible" | "moderate" | "strict";
  operatorName?: string;
}

// ─── Booking ──────────────────────────────────────────────────────────────────
export interface BookingRequest {
  hotelId: string;
  hotelName: string;
  serviceId: string;
  serviceName: string;
  checkin: string;
  checkout: string;
  petName: string;
  petSpecies: PetSpecies;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  totalCents: number;
  currency: string;
}

export interface BookingConfirmation extends BookingRequest {
  bookingId: string;
  status: "pending" | "confirmed";
  createdAt: string;
}
