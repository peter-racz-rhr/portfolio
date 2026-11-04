import { AppCards } from "@/components/app-cards";
import { Hero } from "@/components/hero";
import { HoverGallery } from "@/components/hover-gallery";
import { OnRepeat } from "@/components/on-repeat";
import { SectionLabel } from "@/components/page-header";
import { SayHi } from "@/components/say-hi";
import { photos, projects } from "@/lib/data";

export default function Home() {
  return (
    <main className="flex flex-col gap-24 sm:gap-32">
      <Hero />

      <section>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionLabel href="/gallery" linkText="all pictures">
            Pictures
          </SectionLabel>
        </div>
        <HoverGallery photos={photos} className="py-8" />
      </section>

      <OnRepeat />

      <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionLabel href="/projects" linkText="all projects">
          Some things I made
        </SectionLabel>
        <AppCards projects={projects.slice(0, 3)} />
      </section>

      <SayHi />
    </main>
  );
}
