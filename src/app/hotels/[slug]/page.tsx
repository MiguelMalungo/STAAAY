"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { HotelDetail } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ArrowLeft, Star, MapPin, Phone, Mail, Globe,
  CheckCircle2, Clock, Users, Weight,
} from "lucide-react";

const SPECIES_ICONS: Record<string, string> = {
  dog: "🐕", cat: "🐈", bird: "🦜", rabbit: "🐇",
  small_animal: "🐹", reptile: "🦎", other: "🐾",
};
const SPECIES_LABELS: Record<string, string> = {
  dog: "Dog", cat: "Cat", bird: "Bird", rabbit: "Rabbit",
  small_animal: "Small Animal", reptile: "Reptile", other: "Other",
};
const SERVICE_ICONS: Record<string, string> = {
  overnight_boarding: "🌙", day_care: "☀️", grooming: "✂️",
  training: "🎓", vet_consultation: "🏥", solo_walking: "🦮",
};
const PRICE_UNIT_LABELS: Record<string, string> = {
  per_night: "/ night", per_session: "/ session", per_hour: "/ hr",
};
const POLICY_LABELS: Record<string, string> = {
  flexible: "Flexible — Full refund if cancelled 24h before check-in",
  moderate: "Moderate — 50% refund if cancelled 5+ days before check-in",
  strict: "Strict — No refund after booking",
};

export default function HotelDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const petType = searchParams.get("petType") || "";

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/hotels/${encodeURIComponent(slug)}`);
        const data = await res.json();
        setHotel(data.hotel);
      } catch {
        setHotel(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  function bookService(serviceId: string) {
    if (!hotel) return;
    const p = new URLSearchParams({ hotelId: hotel.id, serviceId, checkin, checkout, petType });
    router.push(`/book?${p.toString()}`);
  }

  if (loading) return <LoadingSpinner message="Loading hotel details..." />;
  if (!hotel) return (
    <div className="text-center py-20">
      <p className="text-lg font-medium">Hotel not found</p>
      <button onClick={() => router.back()} className="mt-4 text-accent hover:underline">Go back</button>
    </div>
  );

  const photos = hotel.photos.length > 0 ? hotel.photos : [hotel.coverPhoto];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="text-sm text-text-secondary hover:text-accent transition-colors mb-6 inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to results
      </button>

      {/* Photo Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 rounded-2xl overflow-hidden">
        <div className="md:col-span-2 relative h-72 md:h-96 bg-surface-alt">
          {photos[activePhoto] && (
            <Image src={photos[activePhoto]} alt={hotel.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 66vw" />
          )}
        </div>
        <div className="hidden md:flex flex-col gap-3">
          {photos.slice(1, 3).map((p, i) => (
            <button key={i} onClick={() => setActivePhoto(i + 1)} className="relative flex-1 bg-surface-alt rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
              <Image src={p} alt={`${hotel.name} photo ${i + 2}`} fill className="object-cover" sizes="33vw" />
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setActivePhoto(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activePhoto ? "border-accent" : "border-transparent hover:border-accent/40"}`}
            >
              <Image src={p} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{hotel.address}</span>
              {hotel.phone && <a href={`tel:${hotel.phone}`} className="flex items-center gap-1 hover:text-accent"><Phone className="w-4 h-4" />{hotel.phone}</a>}
              {hotel.email && <a href={`mailto:${hotel.email}`} className="flex items-center gap-1 hover:text-accent"><Mail className="w-4 h-4" />{hotel.email}</a>}
              {hotel.website && <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent"><Globe className="w-4 h-4" />Website</a>}
            </div>
            {hotel.rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-light px-3 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-amber fill-amber" />
                  <span className="font-bold text-amber">{hotel.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-text-secondary">{hotel.reviewCount} verified reviews</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3">About this hotel</h2>
            <p className="text-text-secondary leading-relaxed">{hotel.description}</p>
          </div>

          {/* Accepted Pets */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Accepted pets</h2>
            <div className="flex flex-wrap gap-3">
              {hotel.acceptedSpecies.map((s) => (
                <div key={s} className="flex items-center gap-2 bg-accent-bg border border-accent-light rounded-xl px-4 py-2.5">
                  <span className="text-2xl">{SPECIES_ICONS[s] || "🐾"}</span>
                  <span className="text-sm font-medium text-accent">{SPECIES_LABELS[s] || s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          {hotel.amenities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {hotel.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancellation Policy */}
          <div className="bg-surface-alt rounded-2xl p-5 border border-border-custom">
            <h2 className="text-lg font-semibold mb-1">Cancellation Policy</h2>
            <p className="text-sm text-text-secondary">{POLICY_LABELS[hotel.cancellationPolicy]}</p>
          </div>
        </div>

        {/* Services Sidebar */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Services & Pricing</h2>
          {hotel.services.map((service) => (
            <div key={service.id} className="bg-surface border border-border-custom rounded-2xl p-5 hover:border-accent/40 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{SERVICE_ICONS[service.serviceType] || "🐾"}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{service.name}</h3>
                  {service.description && <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{service.description}</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {service.durationMinutes && (
                  <span className="text-xs bg-surface-alt px-2 py-1 rounded-lg flex items-center gap-1 text-text-secondary">
                    <Clock className="w-3 h-3" /> {service.durationMinutes}min
                  </span>
                )}
                {service.maxCapacity && (
                  <span className="text-xs bg-surface-alt px-2 py-1 rounded-lg flex items-center gap-1 text-text-secondary">
                    <Users className="w-3 h-3" /> Max {service.maxCapacity}
                  </span>
                )}
                {service.maxWeightKg && (
                  <span className="text-xs bg-surface-alt px-2 py-1 rounded-lg flex items-center gap-1 text-text-secondary">
                    <Weight className="w-3 h-3" /> Up to {service.maxWeightKg}kg
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <span className="text-2xl font-bold">${(service.priceCents / 100).toFixed(0)}</span>
                  <span className="text-xs text-text-secondary ml-1">{PRICE_UNIT_LABELS[service.priceUnit]}</span>
                </div>
                <button
                  onClick={() => bookService(service.id)}
                  className="px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-hover transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
