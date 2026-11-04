import { IconAppWindow, IconArrowUpRight, IconFlask, IconTerminal2 } from "@tabler/icons-react";
import { CopyEmail } from "@/components/copy-email";
import { SectionLabel } from "@/components/page-header";
import { formatMonth, now, services, site, stack, stats, timeline } from "@/lib/data";

/* Scrolling band of the tools I build with (pure CSS, pauses for reduced motion) */
export function StackMarquee() {
  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12" aria-hidden>
      {stack.map((s) => (
        <span key={s} className="flex items-center gap-8 sm:gap-12">
          <span className="font-display text-3xl whitespace-nowrap uppercase sm:text-5xl">{s}</span>
          <span className="size-3 rotate-45 bg-plum sm:size-4" />
        </span>
      ))}
    </div>
  );
  return (
    <section className="overflow-hidden border-y border-fg/10 py-6 sm:py-8" aria-label={`Tools: ${stack.join(", ")}`}>
      <div className="marquee flex w-max">
        {row}
        {row}
      </div>
    </section>
  );
}

/* Big numbers on a dark band */
export function StatsBand() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] bg-canvas/10 text-canvas sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col justify-between gap-6 bg-fg p-6 sm:p-8">
            <span className="font-display text-5xl text-lilac sm:text-7xl">{s.value}</span>
            <span className="font-mono text-xs tracking-widest uppercase opacity-70">{s.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[11px] tracking-wider text-fg/50 uppercase">
        Counted from github.com/{site.handle}
      </p>
    </section>
  );
}

const SERVICE_ICONS = { browser: IconAppWindow, terminal: IconTerminal2, flask: IconFlask };

/* What I build */
export function Services() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <SectionLabel>What I build</SectionLabel>
      <ul className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {services.map((s, i) => {
          const Icon = SERVICE_ICONS[s.icon];
          return (
            <li
              key={s.title}
              className={`flex flex-col gap-10 rounded-[1.75rem] p-6 sm:p-7 ${i === 1 ? "bg-plum text-canvas" : "bg-lilac/60"}`}
            >
              <div className="flex items-start justify-between">
                <Icon className="size-9" stroke={1.5} />
                <span className="font-mono text-xs opacity-60">0{i + 1}</span>
              </div>
              <div>
                <h3 className="font-display text-xl uppercase sm:text-2xl">{s.title}</h3>
                <p className="mt-3 leading-relaxed opacity-80">{s.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* Every repo, newest first, on a vertical line */
export function ShippingLog() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <SectionLabel href={site.github} linkText="github">
        Shipping log
      </SectionLabel>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 className="font-display text-4xl leading-[0.95] uppercase sm:text-6xl">
            Ten repos.
            <br />
            <span className="text-plum">One month</span> went wild.
          </h2>
          <p className="mt-5 max-w-sm text-lg text-fg/70">
            Lorem ipsum dolor sit amet. Every project I&apos;ve put on GitHub, from the first HTML page to what I&apos;m building
            today.
          </p>
        </div>
        <ol className="relative border-l border-fg/15">
          {timeline.map((t, i) => (
            <li key={t.name} className="relative pb-7 pl-7 last:pb-0">
              <span
                className={`absolute top-1.5 -left-[7px] size-3.5 rounded-full border-2 border-canvas ${i === 0 ? "bg-plum" : "bg-fg/30"}`}
              />
              <a
                href={`${site.github}/${t.name}`}
                target="_blank"
                rel="noreferrer"
                className="group grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1"
              >
                <span className="font-display text-lg uppercase transition-colors duration-150 group-hover:text-plum sm:text-xl">
                  {t.name}
                </span>
                <time className="font-mono text-xs text-fg/50 uppercase">{formatMonth(t.date)}</time>
                <span className="text-fg/70">{t.note}</span>
                <span className="justify-self-end rounded-full border border-fg/15 px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-fg/60 uppercase">
                  {t.lang}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* What I'm up to right now */
export function NowSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <div className="grid gap-8 rounded-[2rem] bg-lilac/60 p-6 sm:grid-cols-[auto_1fr] sm:gap-16 sm:p-10">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-plum opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-plum" />
            </span>
            Right now
          </p>
          <h2 className="mt-3 font-display text-6xl leading-none uppercase sm:text-8xl">Now</h2>
        </div>
        <dl className="divide-y divide-fg/10 self-end">
          {now.map((n) => (
            <div key={n.label} className="grid grid-cols-[8rem_1fr] items-baseline gap-4 py-4 sm:grid-cols-[10rem_1fr]">
              <dt className="font-mono text-xs tracking-widest text-fg/60 uppercase">{n.label}</dt>
              <dd className="text-xl font-semibold tracking-tight sm:text-2xl">{n.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

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
