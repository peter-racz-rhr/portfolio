import type { Metadata } from "next";
import { LegalView } from "@/views/legal-view";

export const metadata: Metadata = { title: "Legal notice · Impresszum" };

export default function LegalPage() {
  return <LegalView doc="notice" />;
}
