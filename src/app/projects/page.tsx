import type { Metadata } from "next";
import { AppCards } from "@/components/app-cards";
import { PageHeader } from "@/components/page-header";
import { projects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl">
      <PageHeader
        eyebrow={`${projects.length} apps`}
        title="Projects"
        intro="Lorem ipsum dolor sit amet. Tap a card to open it, tap outside to close."
      />
      <div className="px-5 sm:px-8">
        <AppCards projects={projects} />
      </div>
    </main>
  );
}
