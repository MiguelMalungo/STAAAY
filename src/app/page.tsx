"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import DateRangePicker from "@/components/DateRangePicker";
import { Place } from "@/lib/types";
import { PawPrint, ShieldCheck, Star, Heart, ChevronDown, Search, Moon, Sun, Scissors, GraduationCap, Stethoscope, Footprints, Dog, Cat, Bird, Rabbit } from "lucide-react";

const SPECIES_OPTIONS = [
  { value: "dog", label: "Dog", icon: <Dog className="w-4 h-4" /> },
  { value: "cat", label: "Cat", icon: <Cat className="w-4 h-4" /> },
  { value: "bird", label: "Bird", icon: <Bird className="w-4 h-4" /> },
  { value: "rabbit", label: "Rabbit", icon: <Rabbit className="w-4 h-4" /> },
  { value: "other", label: "Other", icon: <PawPrint className="w-4 h-4" /> },
];

const SERVICE_OPTIONS = [
  { value: "", label: "Any service" },
  { value: "overnight_boarding", label: "Overnight Boarding" },
  { value: "day_care", label: "Day Care" },
  { value: "grooming", label: "Grooming" },
  { value: "training", label: "Training" },
  { value: "vet_consultation", label: "Vet Consultation" },
  { value: "solo_walking", label: "Solo Walking" },
];

export default function Home() {
  const router = useRouter();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), 7),
    to: addDays(new Date(), 10),
  });
  const [petType, setPetType] = useState("dog");
  const [serviceType, setServiceType] = useState("");
  const [petDropdownOpen, setPetDropdownOpen] = useState(false);
  const [mobilePetDropdownOpen, setMobilePetDropdownOpen] = useState(false);
  const petDropdownRef = useRef<HTMLDivElement>(null);
  const mobilePetDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (petDropdownRef.current && !petDropdownRef.current.contains(e.target as Node)) setPetDropdownOpen(false);
      if (mobilePetDropdownRef.current && !mobilePetDropdownRef.current.contains(e.target as Node)) setMobilePetDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedSpecies = SPECIES_OPTIONS.find((s) => s.value === petType)!

  function handleSearch() {
    if (!dateRange?.from || !dateRange?.to || !selectedPlace) return;
    const params = new URLSearchParams({
      checkin: format(dateRange.from, "yyyy-MM-dd"),
      checkout: format(dateRange.to, "yyyy-MM-dd"),
      petType,
      placeId: selectedPlace.placeId,
      placeName: selectedPlace.displayName,
    });
    if (serviceType) params.set("serviceType", serviceType);
    router.push(`/search?${params.toString()}`);
  }

  const canSearch = dateRange?.from && dateRange?.to && selectedPlace;

  return (
    <div className="relative">
      {/* ── Hero ── */}
      <section className="relative flex flex-col">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D9488] via-[#1E3A5F] to-[#0F172A]" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600')] bg-cover bg-center" />

        {/* Hero Content */}
        <div className="relative flex-1 flex items-center justify-center lg:justify-start px-4 sm:px-6 lg:px-8 pt-20 pb-8 lg:pt-32 lg:pb-12 min-h-[320px] lg:min-h-[480px] max-w-7xl mx-auto w-full">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90 mb-6">
              <PawPrint className="w-4 h-4 text-accent-light" />
              <span>Boarding · Daycare · Grooming · All species welcome</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">
              Premium pet care,
              <br />
              <span className="text-accent-light">just a search away</span>
            </h1>
            <p className="text-base lg:text-lg text-white/85 max-w-xl lg:mx-0 drop-shadow">
              Find and book professional pet hotels near you. Every listing is
              vetted, reviewed, and ready to welcome your pet.
            </p>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="relative z-10 w-full hidden lg:block pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-row items-stretch gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
              <div className="flex-[2] min-w-0">
                <PlacesAutocomplete onSelect={setSelectedPlace} selected={selectedPlace} />
              </div>
              <div className="flex-[1.5] min-w-0">
                <DateRangePicker from={dateRange?.from} to={dateRange?.to} onChange={setDateRange} />
              </div>
              <div className="flex-1 min-w-0 relative" ref={petDropdownRef}>
                <button
                  type="button"
                  onClick={() => setPetDropdownOpen((o) => !o)}
                  className="w-full h-full px-4 py-3 pt-7 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer text-left flex items-center gap-2"
                >
                  <span className="text-text-secondary">{selectedSpecies.icon}</span>
                  <span>{selectedSpecies.label}</span>
                </button>
                <span className="absolute left-4 top-2.5 text-xs text-text-secondary pointer-events-none">Pet Type</span>
                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none transition-transform ${petDropdownOpen ? "rotate-180" : ""}`} />
                {petDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-surface border border-border-custom rounded-xl shadow-lg z-50 overflow-hidden">
                    {SPECIES_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => { setPetType(s.value); setPetDropdownOpen(false); }}
                        className={`w-full px-4 py-2.5 text-sm text-left flex items-center gap-2.5 hover:bg-surface-alt transition-colors ${petType === s.value ? "text-accent font-medium" : "text-foreground"}`}
                      >
                        <span className={petType === s.value ? "text-accent" : "text-text-secondary"}>{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 relative">
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full h-full px-4 py-3 pt-7 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer"
                >
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <span className="absolute left-4 top-2.5 text-xs text-text-secondary">Service</span>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={handleSearch}
                  disabled={!canSearch}
                  className="h-full px-8 py-3.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors disabled:bg-accent/50 disabled:cursor-not-allowed text-base inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-5 h-5" />
                  Find Hotels
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile Search ── */}
      <div className="lg:hidden relative z-10 -mt-6">
        <div className="mx-4 bg-surface rounded-2xl shadow-lg border border-border-custom p-4">
          <div className="flex flex-col gap-3">
            <PlacesAutocomplete onSelect={setSelectedPlace} selected={selectedPlace} />
            <DateRangePicker from={dateRange?.from} to={dateRange?.to} onChange={setDateRange} />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative" ref={mobilePetDropdownRef}>
                <button
                  type="button"
                  onClick={() => setMobilePetDropdownOpen((o) => !o)}
                  className="w-full px-3 py-3 pt-7 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none cursor-pointer text-left flex items-center gap-2"
                >
                  <span className="text-text-secondary">{selectedSpecies.icon}</span>
                  <span>{selectedSpecies.label}</span>
                </button>
                <span className="absolute left-3 top-2.5 text-xs text-text-secondary pointer-events-none">Pet Type</span>
                <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none transition-transform ${mobilePetDropdownOpen ? "rotate-180" : ""}`} />
                {mobilePetDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-surface border border-border-custom rounded-xl shadow-lg z-50 overflow-hidden">
                    {SPECIES_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => { setPetType(s.value); setMobilePetDropdownOpen(false); }}
                        className={`w-full px-3 py-2.5 text-sm text-left flex items-center gap-2 hover:bg-surface-alt transition-colors ${petType === s.value ? "text-accent font-medium" : "text-foreground"}`}
                      >
                        <span className={petType === s.value ? "text-accent" : "text-text-secondary"}>{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-3 pt-7 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none appearance-none cursor-pointer"
                >
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <span className="absolute left-3 top-2.5 text-xs text-text-secondary">Service</span>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={!canSearch}
              className="w-full py-3.5 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Find Hotels
            </button>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-center mb-2">Why choose PawStay?</h2>
        <p className="text-text-secondary text-center mb-12 max-w-lg mx-auto">
          Every pet hotel on our platform is reviewed, vetted, and ready to care for your companion.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <ShieldCheck className="w-8 h-8 text-accent" />,
              title: "Verified Facilities",
              desc: "Every listed hotel passes our verification process. Real photos, real reviews, no surprises.",
              bg: "from-accent-bg to-accent-light/30",
            },
            {
              icon: <Star className="w-8 h-8 text-amber" />,
              title: "All Species Welcome",
              desc: "Dogs, cats, birds, reptiles, rabbits, and more. Filter by your exact pet type.",
              bg: "from-amber-light to-amber-light/30",
            },
            {
              icon: <Heart className="w-8 h-8 text-ps-green" />,
              title: "Transparent Pricing",
              desc: "See exact prices before you book. No hidden fees, no surprises at checkout.",
              bg: "from-ps-green-light to-ps-green-light/30",
            },
          ].map((f) => (
            <div
              key={f.title}
              className={`bg-gradient-to-br ${f.bg} rounded-2xl border border-border-custom p-8 flex flex-col items-start`}
            >
              <div className="p-3 bg-white rounded-xl shadow-sm mb-5">{f.icon}</div>
              <h3 className="font-semibold text-xl mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="bg-surface-alt py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-2">Every service, one platform</h2>
          <p className="text-text-secondary text-center mb-10">From overnight boarding to solo walks — book it all on PawStay.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: <Moon className="w-7 h-7" />, label: "Overnight\nBoarding" },
              { icon: <Sun className="w-7 h-7" />, label: "Day\nCare" },
              { icon: <Scissors className="w-7 h-7" />, label: "Grooming" },
              { icon: <GraduationCap className="w-7 h-7" />, label: "Training" },
              { icon: <Stethoscope className="w-7 h-7" />, label: "Vet\nConsultation" },
              { icon: <Footprints className="w-7 h-7" />, label: "Solo\nWalking" },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => { setServiceType(s.label.toLowerCase().replace(/\n/g, "_").replace(" ", "_")); }}
                className="bg-surface rounded-2xl border border-border-custom p-5 flex flex-col items-center gap-2 hover:border-accent hover:shadow-md transition-all group"
              >
                <span className="text-text-secondary group-hover:text-accent transition-colors">{s.icon}</span>
                <span className="text-xs font-medium text-text-secondary group-hover:text-accent transition-colors text-center whitespace-pre-line">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Operator CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-navy to-[#0D9488] rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Run a pet hotel?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
            Join hundreds of pet care professionals on PawStay. List your facility for free and start receiving bookings today.
          </p>
          <button className="px-8 py-3.5 bg-white text-navy font-semibold rounded-xl hover:bg-accent-light transition-colors">
            List Your Hotel — It&apos;s Free
          </button>
          <p className="text-white/50 text-xs mt-4">No listing fees. Only a 10% platform fee on completed bookings.</p>
        </div>
      </section>
    </div>
  );
}
