import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "OutletOps — POS, Inventory & HR for Restaurants & Retail",
  description:
    "OutletOps unifies POS billing, inventory, staff attendance, tasks/SOP, salary, and analytics — built for restaurants and retail with multi-outlet control.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <main>
      <LandingPage />
    </main>
  );
}
