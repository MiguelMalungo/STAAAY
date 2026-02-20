import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Pet Hotels — Boarding, Daycare & More",
  description: "Search and compare pet hotels near you. Filter by pet type, service, price, and rating.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
