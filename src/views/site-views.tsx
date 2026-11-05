"use client";

// The four pages as components that read the site content. The public routes
// render these directly; /admin renders the same ones in edit mode.

import { AppCards } from "@/components/app-cards";
import { T, useContent } from "@/components/content-provider";
import { Hero } from "@/components/hero";
import { HoverGallery } from "@/components/hover-gallery";
import { OnRepeat } from "@/components/on-repeat";
import { PageHeader, SectionLabel } from "@/components/page-header";
import { SayHi } from "@/components/say-hi";
import { TextReveal } from "@/components/text-reveal";
import { DraggableCardBody, DraggableCardContainer } from "@/components/ui/draggable-card";
import type { HomeSectionId } from "@/lib/content";

export function HomeView() {
  const { content } = useContent();
  const { home, photos, projects } = content;

  const sections: Record<HomeSectionId, React.ReactNode> = {
    pictures: (
      <section>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionLabel path="home.picturesLabel" href="/gallery" linkText="all pictures" />
        </div>
        <HoverGallery photos={photos} className="py-8" />
      </section>
    ),
    music: <OnRepeat />,
    projects: (
      <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionLabel path="home.projectsLabel" href="/projects" linkText="all projects" />
        <AppCards projects={projects.slice(0, home.projectsCount)} />
      </section>
    ),
    contact: <SayHi />,
  };

  return (
    <main className="flex flex-col gap-24 sm:gap-32">
      <Hero />
      {home.sections
        .filter((s) => s.visible)
        .map((s) => (
          <div key={s.id} data-section={s.id}>
            {sections[s.id]}
          </div>
        ))}
    </main>
  );
}

export function ProjectsView() {
  const { content } = useContent();
  return (
    <main className="mx-auto w-full max-w-6xl">
      <PageHeader eyebrow={`${content.projects.length} apps`} titlePath="projectsPage.title" introPath="projectsPage.intro" />
      <div className="px-5 sm:px-8">
        <AppCards projects={content.projects} />
      </div>
    </main>
  );
}

export function GalleryView() {
  const { content, resolve } = useContent();
  const { photos } = content;
  return (
    <main className="w-full">
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow={`${photos.length} pictures`} titlePath="galleryPage.title" />
      </div>
      <HoverGallery photos={photos} />
      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-3 px-5 sm:grid-cols-3 sm:px-8">
        {photos.map((p, i) => (
          <figure key={`${i}-${p.name}`} className={i % 5 === 0 ? "row-span-2" : ""} data-edit={`photos.${i}`}>
            <img src={resolve(p.image)} alt={p.name} className="size-full rounded-xl object-cover ring-1 ring-fg/10" />
          </figure>
        ))}
      </div>
    </main>
  );
}

export function AboutView() {
  const { content, resolve } = useContent();
  const { site, about, favPics } = content;
  const contacts = [
    { label: "Email", value: site.email, href: `mailto:${site.email}` },
    { label: "GitHub", value: `@${site.handle}`, href: site.github },
    { label: "Instagram", value: about.instagramHandle, href: site.instagram },
    { label: "Ko-fi", value: about.kofiLabel, href: site.kofi },
  ];

  return (
    <main className="w-full">
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow={<T path="about.eyebrow" />} titlePath="about.title" />
      </div>

      <DraggableCardContainer className="relative mx-auto flex h-[44rem] w-full max-w-6xl items-center justify-center overflow-clip [--card-w:11rem] sm:h-[40rem] sm:[--card-w:15rem]">
        <T
          path="about.dragHint"
          as="p"
          multiline
          className="absolute top-1/2 mx-auto block max-w-sm -translate-y-1/2 px-6 text-center font-sans text-2xl font-semibold tracking-tight text-fg/30 sm:text-3xl"
        />
        {favPics.map((pic, i) => (
          <div
            key={`${i}-${pic.title}`}
            data-edit={`favPics.${i}`}
            className="absolute"
            style={{
              left: `min(${pic.x}%, calc(100% - var(--card-w)))`,
              top: `${pic.y}rem`,
              rotate: `${pic.rotate}deg`,
            }}
          >
            <DraggableCardBody className="min-h-0 w-[var(--card-w)] cursor-grab bg-white p-3 text-fg shadow-xl">
              <img
                src={resolve(pic.image)}
                alt={pic.title}
                draggable={false}
                className="pointer-events-none relative z-10 aspect-[4/5] w-full rounded object-cover"
              />
              <h3 className="mt-3 text-center font-display text-sm uppercase">{pic.title}</h3>
            </DraggableCardBody>
          </div>
        ))}
      </DraggableCardContainer>

      <section className="mx-auto max-w-6xl px-5 py-32 sm:px-8">
        <TextReveal path="about.bio" highlight={about.bioHighlight} />
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel path="about.contactLabel" />
        <ul className="divide-y divide-fg/10" data-edit="site">
          {contacts.map((c) => (
            <li key={c.label}>
              <a href={c.href} target="_blank" rel="noreferrer" className="group flex items-baseline justify-between py-5">
                <span className="font-mono text-xs tracking-widest text-fg/50 uppercase">{c.label}</span>
                <span className="font-sans text-xl font-semibold tracking-tight transition-colors duration-150 group-hover:text-plum sm:text-4xl">
                  {c.value}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
