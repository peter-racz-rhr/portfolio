import { AppCards } from "@/components/app-cards";
import { Hero } from "@/components/hero";
import { NowSection, SayHi, Services, ShippingLog, StackMarquee, StatsBand } from "@/components/home-sections";
import { HoverGallery } from "@/components/hover-gallery";
import { OnRepeat } from "@/components/on-repeat";
import { SectionLabel } from "@/components/page-header";
import { TextReveal } from "@/components/text-reveal";
import { photos, projects } from "@/lib/data";

export default function Home() {
  return (
    <main className="flex flex-col gap-24 sm:gap-32">
      <div>
        <Hero />
        <StackMarquee />
      </div>

      <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <TextReveal highlight={["apps", "here"]}>
          Lorem ipsum dolor sit amet, I build apps when I should be sleeping. Consectetur adipiscing elit, everything I
          make, break and fix again ends up here.
        </TextReveal>
      </section>

      <StatsBand />

      <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionLabel href="/projects" linkText="all projects">
          Selected apps
        </SectionLabel>
        <AppCards projects={projects.slice(0, 3)} />
      </section>

      <Services />

      <ShippingLog />

      <NowSection />

      <OnRepeat />

      <section>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionLabel href="/gallery" linkText="gallery">
            Pictures
          </SectionLabel>
        </div>
        <HoverGallery photos={photos} defaultName="Moments" className="py-8" />
      </section>

      <SayHi />
    </main>
  );
}
