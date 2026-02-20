"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PawPrint } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onDark = isHome && !isScrolled;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-surface/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${onDark ? "bg-white/20" : "bg-accent"}`}>
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <span className={`text-xl font-bold tracking-tight transition-colors ${onDark ? "text-white" : "text-foreground"}`}>
            <span className={onDark ? "text-accent-light" : "text-accent"}>ST<span className={onDark ? "text-white" : "text-foreground"}>AAA</span>Y<span className={onDark ? "text-white" : "text-foreground"}>!</span></span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-4">
          <Link
            href="/search"
            className={`text-sm font-medium transition-colors hover:text-accent ${onDark ? "text-white/80" : "text-text-secondary"}`}
          >
            Find Hotels
          </Link>
          <Link
            href="/#list"
            className={`hidden sm:inline-flex text-sm font-medium transition-colors hover:text-accent ${onDark ? "text-white/80" : "text-text-secondary"}`}
          >
            List Your Hotel
          </Link>
          {/* Auth links — Sprint 1 Task 1.3 */}
          <Link
            href="/login"
            className={`text-sm font-medium px-4 py-2 rounded-xl border transition-all ${onDark ? "border-white/30 text-white hover:bg-white/10" : "border-border-custom text-foreground hover:bg-surface-alt"}`}
          >
            Log in
          </Link>
        </nav>
      </div>
    </header>
  );
}
