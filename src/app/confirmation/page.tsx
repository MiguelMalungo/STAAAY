"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookingRequest } from "@/lib/types";
import { CheckCircle2, PawPrint, Calendar, Mail, Phone, ArrowRight } from "lucide-react";

const SPECIES_ICONS: Record<string, string> = {
  dog: "🐕", cat: "🐈", bird: "🦜", rabbit: "🐇",
  small_animal: "🐹", reptile: "🦎", other: "🐾",
};

export default function ConfirmationPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [bookingId] = useState(() => `PS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);

  useEffect(() => {
    const raw = sessionStorage.getItem("pawstay_booking");
    if (!raw) { router.replace("/"); return; }
    try {
      setBooking(JSON.parse(raw));
    } catch {
      router.replace("/");
    }
    // Clear sensitive data after reading
    sessionStorage.removeItem("pawstay_booking");
  }, [router]);

  if (!booking) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
      {/* Success banner */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10 text-accent" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Booking Request Sent! 🐾</h1>
        <p className="text-text-secondary text-lg">
          {booking.hotelName} will confirm your reservation within 24 hours.
        </p>
      </div>

      {/* Booking ID */}
      <div className="bg-accent-bg border border-accent-light rounded-2xl p-5 mb-6 text-center">
        <p className="text-sm text-text-secondary mb-1">Your booking reference</p>
        <p className="text-3xl font-bold tracking-widest text-accent">{bookingId}</p>
        <p className="text-xs text-text-secondary mt-1">Save this for your records</p>
      </div>

      {/* Details Card */}
      <div className="bg-surface rounded-2xl border border-border-custom p-6 mb-6 space-y-4">
        <h2 className="font-semibold text-lg">Booking Details</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-secondary mb-0.5">Hotel</p>
            <p className="font-medium">{booking.hotelName}</p>
          </div>
          <div>
            <p className="text-text-secondary mb-0.5">Service</p>
            <p className="font-medium">{booking.serviceName}</p>
          </div>
          <div className="flex items-start gap-1.5">
            <Calendar className="w-4 h-4 text-text-secondary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-text-secondary text-xs mb-0.5">Check-in</p>
              <p className="font-medium">{booking.checkin}</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <Calendar className="w-4 h-4 text-text-secondary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-text-secondary text-xs mb-0.5">Check-out</p>
              <p className="font-medium">{booking.checkout}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border-custom pt-4 text-sm">
          <p className="text-text-secondary mb-0.5">Your pet</p>
          <p className="font-medium flex items-center gap-1.5">
            <span className="text-xl">{SPECIES_ICONS[booking.petSpecies] || "🐾"}</span>
            {booking.petName} ({booking.petSpecies})
          </p>
        </div>

        <div className="border-t border-border-custom pt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">Subtotal</span>
            <span>${(booking.totalCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2 text-text-secondary">
            <span>Platform fee (10%)</span>
            <span>${(booking.totalCents / 100 * 0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-border-custom pt-2">
            <span>Total</span>
            <span>${(booking.totalCents / 100 * 1.1).toFixed(2)} {booking.currency}</span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-surface-alt rounded-2xl p-5 mb-6 text-sm space-y-2">
        <h3 className="font-semibold">Confirmation details sent to</h3>
        <div className="flex items-center gap-2 text-text-secondary">
          <Mail className="w-4 h-4" />{booking.guestEmail}
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <Phone className="w-4 h-4" />{booking.guestPhone}
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-amber-light/40 border border-amber-light rounded-2xl p-5 mb-8">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <PawPrint className="w-4 h-4 text-amber" /> What happens next?
        </h3>
        <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
          <li>The hotel reviews your request and confirms availability.</li>
          <li>You receive a confirmation email within 24 hours.</li>
          <li>Payment will be processed securely via Stripe (coming soon).</li>
          <li>Pack your pet&apos;s favourite toy and you&apos;re all set! 🐾</li>
        </ol>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex-1 py-3 border border-border-custom rounded-xl text-sm font-medium hover:bg-surface-alt transition-colors"
        >
          Back to Home
        </button>
        <button
          onClick={() => router.push("/search")}
          className="flex-1 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition-colors inline-flex items-center justify-center gap-2"
        >
          Find Another Hotel <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
