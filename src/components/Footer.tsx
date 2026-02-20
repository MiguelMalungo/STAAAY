import Link from "next/link";
import { PawPrint } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border-custom bg-surface-alt mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground"><span className="text-accent">ST<span className="text-foreground">AAA</span>Y<span className="text-foreground">!</span></span></span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-text-secondary">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <Link href="/search" className="hover:text-accent transition-colors">Find Hotels</Link>
            <Link href="/#list" className="hover:text-accent transition-colors">For Hotels</Link>
          </nav>

          <p className="text-xs text-warm-gray">© 2026 PawStay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
