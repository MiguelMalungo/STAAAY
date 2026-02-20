import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pawstay.com";
const SITE_NAME = "PawStay";
const SITE_DESCRIPTION =
  "Find and book professional pet hotels near you. Boarding, daycare, grooming and more — for dogs, cats, birds, reptiles, and every pet in between.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PawStay — Premium Pet Hotel Booking | All Pets Welcome",
    template: "%s | PawStay",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "pet hotel", "dog boarding", "cat boarding", "pet daycare",
    "pet grooming", "bird boarding", "reptile boarding", "exotic pet hotel",
    "pet care near me", "dog kennel", "cat hotel", "pet sitting",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "PawStay — Premium Pet Hotel Booking",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "PawStay — Premium Pet Hotel Booking",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: SITE_URL },
  other: { "theme-color": "#0D9488" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
