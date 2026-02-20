import { HotelDetail } from "./types";

// Mock pet hotel data — replace with Supabase queries once your DB is set up (Sprint 1, Task 1.2)
export const MOCK_HOTELS: HotelDetail[] = [
  {
    id: "happy-paws-miami",
    slug: "happy-paws-lodge-miami",
    name: "Happy Paws Lodge",
    city: "Miami",
    country: "US",
    address: "1240 Brickell Ave, Miami, FL 33131",
    rating: 4.8,
    reviewCount: 124,
    coverPhoto: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
    photos: [
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
      "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=800",
    ],
    description:
      "Miami's premium pet boarding experience. Our climate-controlled facility offers private suites, daily outdoor playtime, and 24/7 staff. Dogs and cats enjoy spacious accommodations with webcam access so you can check in anytime.",
    acceptedSpecies: ["dog", "cat"],
    amenities: ["Outdoor play area", "Webcam access", "24/7 staff", "Air conditioning", "Individual suites"],
    tags: ["Premium", "Webcam", "24/7"],
    cancellationPolicy: "moderate",
    phone: "+1 (305) 555-0142",
    email: "hello@happypawslodge.com",
    latitude: 25.7617,
    longitude: -80.1918,
    services: [
      {
        id: "hpl-boarding",
        serviceType: "overnight_boarding",
        name: "Overnight Boarding",
        description: "Private suite with cozy bedding, 3 daily walks, and feeding to your schedule.",
        priceCents: 6500,
        currency: "USD",
        priceUnit: "per_night",
        maxCapacity: 20,
        acceptedSpecies: ["dog", "cat"],
        maxWeightKg: 50,
      },
      {
        id: "hpl-daycare",
        serviceType: "day_care",
        name: "Day Care",
        description: "Drop off in the morning, pick up in the evening. Supervised play all day.",
        priceCents: 3500,
        currency: "USD",
        priceUnit: "per_session",
        durationMinutes: 480,
        maxCapacity: 15,
        acceptedSpecies: ["dog"],
        maxWeightKg: 40,
      },
      {
        id: "hpl-grooming",
        serviceType: "grooming",
        name: "Full Groom",
        description: "Bath, blow-dry, haircut, nail trim, ear cleaning, and bandana.",
        priceCents: 7500,
        currency: "USD",
        priceUnit: "per_session",
        durationMinutes: 120,
        acceptedSpecies: ["dog", "cat"],
      },
    ],
  },
  {
    id: "feathered-nest-austin",
    slug: "the-feathered-nest-austin",
    name: "The Feathered Nest",
    city: "Austin",
    country: "US",
    address: "803 E 6th St, Austin, TX 78702",
    rating: 4.9,
    reviewCount: 87,
    coverPhoto: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800",
    photos: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800",
      "https://images.unsplash.com/photo-1544473244-46e07aa27ac4?w=800",
    ],
    description:
      "Austin's only specialist facility for birds, rabbits, and small animals. Our trained staff understands exotic pets and provides species-appropriate care in a calm, quiet environment.",
    acceptedSpecies: ["bird", "rabbit", "small_animal"],
    amenities: ["Quiet environment", "Species-trained staff", "Temperature control", "Natural light"],
    tags: ["Exotic pets", "Specialist", "Quiet"],
    cancellationPolicy: "flexible",
    phone: "+1 (512) 555-0198",
    email: "care@thefeatherednest.com",
    latitude: 30.2672,
    longitude: -97.7431,
    services: [
      {
        id: "tfn-boarding",
        serviceType: "overnight_boarding",
        name: "Exotic Pet Boarding",
        description: "Custom habitats maintained to your pet's exact environmental needs.",
        priceCents: 4500,
        currency: "USD",
        priceUnit: "per_night",
        maxCapacity: 30,
        acceptedSpecies: ["bird", "rabbit", "small_animal"],
      },
      {
        id: "tfn-vet",
        serviceType: "vet_consultation",
        name: "Exotic Vet Check",
        description: "On-site consultation with our exotic animal veterinarian.",
        priceCents: 9500,
        currency: "USD",
        priceUnit: "per_session",
        durationMinutes: 45,
        acceptedSpecies: ["bird", "rabbit", "small_animal"],
      },
    ],
  },
  {
    id: "bark-breakfast-brooklyn",
    slug: "bark-and-breakfast-brooklyn",
    name: "Bark & Breakfast",
    city: "New York",
    country: "US",
    address: "47 Bedford Ave, Brooklyn, NY 11211",
    rating: 4.7,
    reviewCount: 213,
    coverPhoto: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    photos: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800",
    ],
    description:
      "Brooklyn's coziest dog boarding house. We keep groups small (max 6 dogs) so every pup gets personalized attention. Home-cooked meals available on request.",
    acceptedSpecies: ["dog"],
    amenities: ["Small groups", "Home-cooked meals", "Daily walks", "Indoor play area", "Rooftop terrace"],
    tags: ["Small groups", "NYC", "Premium"],
    cancellationPolicy: "flexible",
    phone: "+1 (718) 555-0071",
    email: "woof@barkandbreakfast.com",
    latitude: 40.7128,
    longitude: -74.006,
    services: [
      {
        id: "bb-boarding",
        serviceType: "overnight_boarding",
        name: "In-Home Boarding",
        description: "Your dog stays in our home-like facility with a small family group of dogs.",
        priceCents: 8000,
        currency: "USD",
        priceUnit: "per_night",
        maxCapacity: 6,
        acceptedSpecies: ["dog"],
        maxWeightKg: 35,
      },
      {
        id: "bb-daycare",
        serviceType: "day_care",
        name: "Doggy Day Care",
        description: "Full day of socialisation, play, and training reinforcement.",
        priceCents: 4500,
        currency: "USD",
        priceUnit: "per_session",
        durationMinutes: 480,
        acceptedSpecies: ["dog"],
      },
      {
        id: "bb-training",
        serviceType: "training",
        name: "Basic Training Session",
        description: "1-on-1 training with a certified positive-reinforcement trainer.",
        priceCents: 12000,
        currency: "USD",
        priceUnit: "per_session",
        durationMinutes: 60,
        acceptedSpecies: ["dog"],
      },
      {
        id: "bb-walking",
        serviceType: "solo_walking",
        name: "Solo Walk",
        description: "30-minute solo walk by a certified dog walker.",
        priceCents: 2500,
        currency: "USD",
        priceUnit: "per_session",
        durationMinutes: 30,
        acceptedSpecies: ["dog"],
      },
    ],
  },
  {
    id: "kitty-spa-la",
    slug: "kitty-spa-and-hotel-los-angeles",
    name: "Kitty Spa & Hotel",
    city: "Los Angeles",
    country: "US",
    address: "1100 S Hope St, Los Angeles, CA 90015",
    rating: 4.9,
    reviewCount: 165,
    coverPhoto: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
    photos: [
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
      "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800",
    ],
    description:
      "LA's most luxurious cat-only hotel. Cats enjoy private condos with climbing walls, window perches, and a cat TV channel. Zero dogs on premises — guaranteed.",
    acceptedSpecies: ["cat"],
    amenities: ["Cat-only facility", "Private condos", "Climbing walls", "Cat TV", "Webcam access", "Groomer on staff"],
    tags: ["Cat-only", "Luxury", "LA"],
    cancellationPolicy: "moderate",
    phone: "+1 (213) 555-0033",
    email: "purr@kittyspa.com",
    latitude: 34.0522,
    longitude: -118.2437,
    services: [
      {
        id: "ks-boarding",
        serviceType: "overnight_boarding",
        name: "Cat Suite Boarding",
        description: "Private condo with climbing wall, window perch, and daily cuddle time.",
        priceCents: 7000,
        currency: "USD",
        priceUnit: "per_night",
        maxCapacity: 25,
        acceptedSpecies: ["cat"],
      },
      {
        id: "ks-grooming",
        serviceType: "grooming",
        name: "Cat Spa Groom",
        description: "Cat-specific shampoo, blow-dry, nail trim, and ear cleaning.",
        priceCents: 8500,
        currency: "USD",
        priceUnit: "per_session",
        durationMinutes: 90,
        acceptedSpecies: ["cat"],
      },
    ],
  },
  {
    id: "all-creatures-chicago",
    slug: "all-creatures-inn-chicago",
    name: "All Creatures Inn",
    city: "Chicago",
    country: "US",
    address: "2200 N Lincoln Park W, Chicago, IL 60614",
    rating: 4.6,
    reviewCount: 302,
    coverPhoto: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800",
    photos: [
      "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800",
      "https://images.unsplash.com/photo-1608096299210-db7e38487075?w=800",
    ],
    description:
      "Chicago's most versatile pet hotel, welcoming all species under one roof. Our 15,000 sq ft facility is divided into species-specific zones with on-call veterinary care.",
    acceptedSpecies: ["dog", "cat", "bird", "rabbit", "small_animal", "reptile"],
    amenities: ["All species welcome", "Vet on call", "Outdoor play area", "24/7 staff", "CCTV monitoring", "Species-specific zones"],
    tags: ["All species", "Vet on-call", "Large facility"],
    cancellationPolicy: "strict",
    phone: "+1 (312) 555-0207",
    email: "info@allcreaturesinn.com",
    latitude: 41.8781,
    longitude: -87.6298,
    services: [
      {
        id: "ac-boarding",
        serviceType: "overnight_boarding",
        name: "Overnight Boarding",
        description: "Species-appropriate housing with daily care included.",
        priceCents: 5500,
        currency: "USD",
        priceUnit: "per_night",
        maxCapacity: 60,
        acceptedSpecies: ["dog", "cat", "bird", "rabbit", "small_animal", "reptile"],
      },
      {
        id: "ac-daycare",
        serviceType: "day_care",
        name: "Day Care",
        description: "Full day supervised care with enrichment activities.",
        priceCents: 3000,
        currency: "USD",
        priceUnit: "per_session",
        durationMinutes: 480,
        acceptedSpecies: ["dog", "cat"],
      },
      {
        id: "ac-grooming",
        serviceType: "grooming",
        name: "Grooming",
        description: "Full bath, trim, and nail care for dogs and cats.",
        priceCents: 6000,
        currency: "USD",
        priceUnit: "per_session",
        durationMinutes: 90,
        acceptedSpecies: ["dog", "cat"],
      },
      {
        id: "ac-vet",
        serviceType: "vet_consultation",
        name: "Vet Consultation",
        description: "On-site consultation with our licensed veterinarian.",
        priceCents: 8500,
        currency: "USD",
        priceUnit: "per_session",
        durationMinutes: 30,
        acceptedSpecies: ["dog", "cat", "bird", "rabbit", "small_animal", "reptile"],
      },
    ],
  },
  {
    id: "reptile-resort-denver",
    slug: "reptile-resort-denver",
    name: "Reptile Resort",
    city: "Denver",
    country: "US",
    address: "1600 Glenarm Pl, Denver, CO 80202",
    rating: 4.7,
    reviewCount: 48,
    coverPhoto: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
    photos: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
    ],
    description:
      "Colorado's only specialist reptile boarding facility. We house lizards, snakes, turtles, and geckos with precise temperature, humidity, and UV lighting maintained 24/7.",
    acceptedSpecies: ["reptile"],
    amenities: ["Temperature control", "UV lighting", "Humidity control", "Reptile specialist staff", "Feeding schedule maintained"],
    tags: ["Reptile specialist", "Denver", "Exotic"],
    cancellationPolicy: "moderate",
    phone: "+1 (720) 555-0088",
    email: "scales@reptileresort.com",
    latitude: 39.7392,
    longitude: -104.9903,
    services: [
      {
        id: "rr-boarding",
        serviceType: "overnight_boarding",
        name: "Reptile Boarding",
        description: "Custom terrarium setup maintained to your reptile's exact environmental specifications.",
        priceCents: 4000,
        currency: "USD",
        priceUnit: "per_night",
        maxCapacity: 40,
        acceptedSpecies: ["reptile"],
      },
      {
        id: "rr-vet",
        serviceType: "vet_consultation",
        name: "Reptile Vet Check",
        description: "Specialist reptile health check with our herp vet.",
        priceCents: 11000,
        currency: "USD",
        priceUnit: "per_session",
        durationMinutes: 45,
        acceptedSpecies: ["reptile"],
      },
    ],
  },
];

export function getHotelById(id: string): HotelDetail | undefined {
  return MOCK_HOTELS.find((h) => h.id === id || h.slug === id);
}

export function searchHotels(params: {
  city?: string;
  petType?: string;
  serviceType?: string;
}): HotelDetail[] {
  let results = [...MOCK_HOTELS];

  if (params.city) {
    const cityLower = params.city.toLowerCase();
    results = results.filter(
      (h) =>
        h.city.toLowerCase().includes(cityLower) ||
        h.address.toLowerCase().includes(cityLower)
    );
  }

  if (params.petType && params.petType !== "other") {
    results = results.filter((h) =>
      h.acceptedSpecies.includes(params.petType as never)
    );
  }

  if (params.serviceType) {
    results = results.filter((h) =>
      h.services.some((s) => s.serviceType === params.serviceType)
    );
  }

  return results;
}
