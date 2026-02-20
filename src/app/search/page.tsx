"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import HotelCardSkeleton from "@/components/HotelCardSkeleton";
import { HotelBrief, PetSpecies } from "@/lib/types";
import { PawPrint, ArrowLeft, Building2, ArrowRight, Star } from "lucide-react";

const SPECIES_ICONS: Record<string, string> = {
  dog: "🐕", cat: "🐈", bird: "🦜", rabbit: "🐇",
  small_animal: "🐹", reptile: "🦎", other: "🐾",
};

const SERVICE_LABELS: Record<string, string> = {
  overnight_boarding: "Boarding",
  day_care: "Day Care",
  grooming: "Grooming",
  training: "Training",
  vet_consultation: "Vet",
  solo_walking: "Walking",
};

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const placeName = searchParams.get("placeName") || "";
  const petType = searchParams.get("petType") || "";
  const serviceType = searchParams.get("serviceType") || "";

  const [hotels, setHotels] = useState<HotelBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (placeName) params.set("city", placeName);
      if (petType) params.set("petType", petType);
      if (serviceType) params.set("serviceType", serviceType);

      const res = await fetch(`/api/hotels?${params.toString()}`);
      const data = await res.json();

      if (!data.hotels || data.hotels.length === 0) {
        setError("No pet hotels found for your search. Try a different city or adjust your filters.");
      } else {
        setHotels(data.hotels);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [placeName, petType, serviceType]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    const dest = placeName || "your area";
    document.title = `Pet Hotels in ${dest} | PawStay`;
  }, [placeName]);

  function navigateToHotel(slug: string) {
    const params = new URLSearchParams({ checkin, checkout, petType, serviceType });
    router.push(`/hotels/${slug}?${params.toString()}`);
  }

  function lowestPrice(hotel: HotelBrief): number {
    if (!hotel.services.length) return 0;
    return Math.min(...hotel.services.map((s) => s.priceCents)) / 100;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-14">
      <div className="mb-8">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-text-secondary hover:text-accent transition-colors mb-4 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to search
        </button>
        <h1 className="text-2xl font-bold text-foreground">
          Pet hotels{placeName ? ` in ${placeName}` : " near you"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {checkin && checkout ? `${checkin} to ${checkout} · ` : ""}
          {petType ? `${SPECIES_ICONS[petType] || "🐾"} ${petType}` : "All pets"}
          {serviceType ? ` · ${SERVICE_LABELS[serviceType] || serviceType}` : ""}
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <HotelCardSkeleton key={i} />)}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-20">
          <PawPrint className="w-12 h-12 text-warm-gray mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">No pet hotels found</p>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Try a new search
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="text-sm text-text-secondary mb-6">
            {hotels.length} {hotels.length === 1 ? "hotel" : "hotels"} found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <button
                key={hotel.id}
                onClick={() => navigateToHotel(hotel.slug)}
                className="bg-surface rounded-2xl border border-border-custom overflow-hidden text-left hover:shadow-lg hover:border-accent/30 transition-all group"
              >
                {/* Photo */}
                <div className="relative h-48 bg-surface-alt overflow-hidden">
                  {hotel.coverPhoto ? (
                    <Image
                      src={hotel.coverPhoto}
                      alt={hotel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-warm-gray">
                      <Building2 className="w-10 h-10" />
                    </div>
                  )}
                  {/* Species badges */}
                  <div className="absolute top-3 left-3 flex gap-1">
                    {hotel.acceptedSpecies.slice(0, 3).map((s) => (
                      <span key={s} className="bg-white/90 backdrop-blur-sm text-sm px-2 py-0.5 rounded-full" title={s}>
                        {SPECIES_ICONS[s] || "🐾"}
                      </span>
                    ))}
                    {hotel.acceptedSpecies.length > 3 && (
                      <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-0.5 rounded-full text-text-secondary">
                        +{hotel.acceptedSpecies.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-semibold text-foreground text-lg leading-tight mb-1 group-hover:text-accent transition-colors">
                    {hotel.name}
                  </h3>
                  <p className="text-sm text-text-secondary mb-3">{hotel.city}, {hotel.country}</p>

                  {/* Rating */}
                  {hotel.rating > 0 && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex items-center gap-1 bg-amber-light px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 text-amber fill-amber" />
                        <span className="text-xs font-bold text-amber">{hotel.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-text-secondary">({hotel.reviewCount} reviews)</span>
                    </div>
                  )}

                  {/* Services */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {hotel.services.slice(0, 3).map((s) => (
                      <span key={s.id} className="text-xs px-2 py-0.5 rounded-full bg-accent-bg text-accent font-medium">
                        {SERVICE_LABELS[s.serviceType] || s.serviceType}
                      </span>
                    ))}
                    {hotel.services.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-alt text-text-secondary">
                        +{hotel.services.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs text-text-secondary">from</span>
                      <p className="text-xl font-bold">${lowestPrice(hotel).toFixed(0)}<span className="text-xs font-normal text-text-secondary ml-1">USD</span></p>
                    </div>
                    <span className="text-sm text-accent font-medium group-hover:underline inline-flex items-center gap-1">
                      View hotel <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <HotelCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
