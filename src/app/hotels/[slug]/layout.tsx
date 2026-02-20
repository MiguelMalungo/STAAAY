import { MOCK_HOTELS } from "@/lib/mockData";

export function generateStaticParams() {
  return MOCK_HOTELS.map((h) => ({ slug: h.slug }));
}

export default function HotelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
