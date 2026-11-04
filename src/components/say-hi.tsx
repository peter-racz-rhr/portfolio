import { IconArrowUpRight } from "@tabler/icons-react";
import { CopyEmail } from "@/components/copy-email";
import { site } from "@/lib/data";

/* Closing contact block */
export function SayHi() {
  const links = [
    { label: "GitHub", href: site.github },
    { label: "Instagram", href: site.instagram },
    { label: "Ko-fi", href: site.kofi },
  ];
  return (
    <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <div className="rounded-[2.5rem] bg-fg px-6 py-12 text-canvas sm:px-12 sm:py-16">
        <p className="font-mono text-xs tracking-widest text-lilac uppercase">Got an idea?</p>
        <h2 className="mt-4 font-display text-[clamp(2.5rem,9vw,7.5rem)] leading-[0.9] uppercase">
          Say <span className="text-lilac">hi</span>
        </h2>
        <p className="mt-6 max-w-md text-lg opacity-75">
          Lorem ipsum dolor sit amet. Want to build something together, or just talk apps? Drop me a line.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CopyEmail email={site.email} />
          <div className="flex flex-wrap gap-2">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-canvas/25 px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-canvas hover:text-fg"
              >
                {l.label} <IconArrowUpRight className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
