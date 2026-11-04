import type { Metadata } from "next";
import { DraggableCardBody, DraggableCardContainer } from "@/components/ui/draggable-card";
import { PageHeader, SectionLabel } from "@/components/page-header";
import { TextReveal } from "@/components/text-reveal";
import { favPics, site } from "@/lib/data";

export const metadata: Metadata = { title: "About" };

const contacts = [
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "GitHub", value: `@${site.handle}`, href: site.github },
  { label: "Instagram", value: "@lorem.ipsum", href: site.instagram },
  { label: "Ko-fi", value: "buy me a coffee", href: site.kofi },
];

export default function AboutPage() {
  return (
    <main className="w-full">
      <div className="mx-auto max-w-6xl">
        <PageHeader eyebrow="hi, it's me" title="About" />
      </div>

      <DraggableCardContainer className="relative mx-auto flex h-[44rem] w-full max-w-6xl items-center justify-center overflow-clip sm:h-[40rem]">
        <p className="absolute top-1/2 mx-auto max-w-sm -translate-y-1/2 px-6 text-center font-sans text-2xl font-semibold tracking-tight text-fg/30 sm:text-3xl">
          These are a few of my favourite things. Drag them around.
        </p>
        {favPics.map((pic) => (
          <DraggableCardBody
            key={pic.title}
            className={`${pic.className} min-h-0 w-44 cursor-grab bg-white p-3 text-fg shadow-xl sm:w-60`}
          >
            <img
              src={pic.image}
              alt={pic.title}
              draggable={false}
              className="pointer-events-none relative z-10 aspect-[4/5] w-full rounded object-cover"
            />
            <h3 className="mt-3 text-center font-display text-sm uppercase">{pic.title}</h3>
          </DraggableCardBody>
        ))}
      </DraggableCardContainer>

      <section className="mx-auto max-w-6xl px-5 py-32 sm:px-8">
        <TextReveal highlight={["Budapest", "TypeScript"]}>
          Lorem ipsum dolor sit amet, I live in Budapest and write a lot of TypeScript. Sed do eiusmod tempor incididunt ut
          labore et dolore magna aliqua, ut enim ad minim veniam.
        </TextReveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionLabel>Say hi</SectionLabel>
        <ul className="divide-y divide-fg/10">
          {contacts.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-baseline justify-between py-5"
              >
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
