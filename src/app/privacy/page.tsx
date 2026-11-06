import type { Metadata } from "next";
import { LegalView } from "@/views/legal-view";

export const metadata: Metadata = { title: "Privacy policy · Adatkezelési tájékoztató" };

export default function PrivacyPage() {
  return <LegalView doc="privacy" />;
}
