"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HotelDetail, HotelService, BookingRequest, PetSpecies } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PawPrint, ArrowLeft, Calendar, CheckCircle2 } from "lucide-react";

const SPECIES_OPTIONS: { value: PetSpecies; label: string; emoji: string }[] = [
  { value: "dog", label: "Dog", emoji: "🐕" },
  { value: "cat", label: "Cat", emoji: "🐈" },
  { value: "bird", label: "Bird", emoji: "🦜" },
  { value: "rabbit", label: "Rabbit", emoji: "🐇" },
  { value: "small_animal", label: "Small Animal", emoji: "🐹" },
  { value: "reptile", label: "Reptile", emoji: "🦎" },
  { value: "other", label: "Other", emoji: "🐾" },
];

const PRICE_UNIT_LABELS: Record<string, string> = {
  per_night: "/ night", per_session: "/ session", per_hour: "/ hr",
};

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const hotelId = searchParams.get("hotelId") || "";
  const serviceId = searchParams.get("serviceId") || "";
  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const petTypeParam = searchParams.get("petType") || "dog";

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [service, setService] = useState<HotelService | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const [form, setForm] = useState({
    petName: "",
    petSpecies: petTypeParam as PetSpecies,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      if (!hotelId) return;
      try {
        const res = await fetch(`/api/hotels/${encodeURIComponent(hotelId)}`);
        const data = await res.json();
        setHotel(data.hotel);
        const svc = data.hotel?.services?.find((s: HotelService) => s.id === serviceId);
        setService(svc || data.hotel?.services?.[0] || null);
      } catch {
        setHotel(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hotelId, serviceId]);

  function calcNights(): number {
    if (!checkin || !checkout) return 1;
    const d1 = new Date(checkin), d2 = new Date(checkout);
    return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000));
  }

  function calcTotal(): number {
    if (!service) return 0;
    const price = service.priceCents / 100;
    return service.priceUnit === "per_night" ? price * calcNights() : price;
  }

  function validate(fields: typeof form): Record<string, string> {
    const e: Record<string, string> = {};
    if (!fields.petName.trim()) e.petName = "Pet name is required";
    if (!fields.guestName.trim()) e.guestName = "Your name is required";
    if (!fields.guestEmail.trim() || !fields.guestEmail.includes("@")) e.guestEmail = "Valid email is required";
    if (!fields.guestPhone.trim()) e.guestPhone = "Phone number is required";
    return e;
  }

  function handleStep1() {
    const e: Record<string, string> = {};
    if (!form.petName.trim()) e.petName = "Pet name is required";
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setStep(2);
  }

  async function handleSubmit() {
    const e = validate(form);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (!hotel || !service) return;
    setSubmitting(true);
    try {
      const booking: BookingRequest = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        serviceId: service.id,
        serviceName: service.name,
        checkin,
        checkout,
        petName: form.petName,
        petSpecies: form.petSpecies,
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        guestPhone: form.guestPhone,
        specialRequests: form.specialRequests,
        totalCents: Math.round(calcTotal() * 100),
        currency: service.currency,
      };
      // Save to sessionStorage (Stripe payment added in Sprint 4)
      sessionStorage.setItem("pawstay_booking", JSON.stringify(booking));
      router.push("/confirmation");
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading booking details..." />;
  if (!hotel || !service) return (
    <div className="text-center py-20">
      <p className="text-lg font-medium mb-4">Hotel or service not found</p>
      <button onClick={() => router.back()} className="text-accent hover:underline">Go back</button>
    </div>
  );

  const nights = calcNights();
  const total = calcTotal();

  const inputCls = "w-full px-4 py-3 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all";
  const labelCls = "block text-sm font-medium mb-1.5";
  const errorCls = "text-xs text-error mt-1";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
      <button onClick={() => router.back()} className="text-sm text-text-secondary hover:text-accent mb-6 inline-flex items-center gap-1.5">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to hotel
      </button>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= n ? "bg-accent text-white" : "bg-surface-alt text-text-secondary border border-border-custom"}`}>
              {step > n ? <CheckCircle2 className="w-5 h-5" /> : n}
            </div>
            <span className={`text-sm ${step === n ? "font-semibold" : "text-text-secondary"}`}>
              {n === 1 ? "Pet Details" : "Your Details"}
            </span>
            {n < 2 && <div className={`w-12 h-0.5 ${step > n ? "bg-accent" : "bg-border-custom"}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === 1 ? (
            <div className="bg-surface rounded-2xl border border-border-custom p-6 space-y-5">
              <h2 className="text-xl font-semibold">Tell us about your pet</h2>
              <div>
                <label className={labelCls}>Pet&apos;s name *</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Buddy"
                  value={form.petName}
                  onChange={(e) => setForm((f) => ({ ...f, petName: e.target.value }))}
                />
                {errors.petName && <p className={errorCls}>{errors.petName}</p>}
              </div>
              <div>
                <label className={labelCls}>Pet species *</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {SPECIES_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, petSpecies: s.value }))}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-sm ${form.petSpecies === s.value ? "border-accent bg-accent-bg text-accent font-semibold" : "border-border-custom hover:border-accent/40"}`}
                    >
                      <span className="text-2xl">{s.emoji}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Special needs or notes (optional)</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  placeholder="Any medical conditions, dietary needs, or care instructions..."
                  value={form.specialRequests}
                  onChange={(e) => setForm((f) => ({ ...f, specialRequests: e.target.value }))}
                />
              </div>
              <button onClick={handleStep1} className="w-full py-3.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors">
                Continue to Your Details →
              </button>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-border-custom p-6 space-y-5">
              <h2 className="text-xl font-semibold">Your contact details</h2>
              <div>
                <label className={labelCls}>Full name *</label>
                <input className={inputCls} placeholder="Your full name" value={form.guestName} onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))} />
                {errors.guestName && <p className={errorCls}>{errors.guestName}</p>}
              </div>
              <div>
                <label className={labelCls}>Email address *</label>
                <input type="email" className={inputCls} placeholder="you@example.com" value={form.guestEmail} onChange={(e) => setForm((f) => ({ ...f, guestEmail: e.target.value }))} />
                {errors.guestEmail && <p className={errorCls}>{errors.guestEmail}</p>}
              </div>
              <div>
                <label className={labelCls}>Phone number *</label>
                <input type="tel" className={inputCls} placeholder="+1 (555) 000-0000" value={form.guestPhone} onChange={(e) => setForm((f) => ({ ...f, guestPhone: e.target.value }))} />
                {errors.guestPhone && <p className={errorCls}>{errors.guestPhone}</p>}
              </div>

              <div className="bg-amber-light/50 border border-amber-light rounded-xl p-4 text-sm text-text-secondary">
                <strong className="text-foreground">💳 Payment:</strong> Secure Stripe payment will be added in the next update. Your booking request will be sent to the hotel immediately.
              </div>

              {errors.submit && <p className={errorCls}>{errors.submit}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3.5 bg-surface-alt text-foreground font-semibold rounded-xl hover:bg-border-custom transition-colors">
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-[2] py-3.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Request Booking"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-2xl border border-border-custom p-6 sticky top-24">
            <h3 className="font-semibold mb-4">Booking Summary</h3>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-custom">
              <PawPrint className="w-8 h-8 text-accent flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{hotel.name}</p>
                <p className="text-xs text-text-secondary">{hotel.city}</p>
              </div>
            </div>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Calendar className="w-4 h-4" />
                <span>{checkin} → {checkout}</span>
              </div>
              <p className="font-medium">{service.name}</p>
              {service.priceUnit === "per_night" && (
                <p className="text-text-secondary text-xs">${(service.priceCents / 100).toFixed(0)} × {nights} night{nights !== 1 ? "s" : ""}</p>
              )}
            </div>
            <div className="border-t border-border-custom pt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Subtotal</span><span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3 text-text-secondary">
                <span>Platform fee (10%)</span><span>${(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-border-custom pt-3">
                <span>Total</span><span>${(total * 1.1).toFixed(2)} {service.currency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading..." />}>
      <BookingForm />
    </Suspense>
  );
}
