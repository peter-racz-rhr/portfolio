import type { Metadata } from "next";
import { AboutView } from "@/views/site-views";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return <AboutView />;
}
