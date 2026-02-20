import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Request Sent",
  robots: { index: false, follow: false },
};

export default function ConfirmationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
