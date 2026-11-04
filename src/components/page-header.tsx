export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <header className="px-5 pt-20 pb-12 sm:px-8 sm:pt-28">
      <p className="font-mono text-xs tracking-widest text-plum uppercase">{eyebrow}</p>
      <h1 className="mt-3 font-display text-[clamp(2.2rem,9vw,7rem)] leading-[0.95] tracking-tight uppercase">{title}</h1>
      {intro && <p className="mt-6 max-w-xl text-lg text-fg/70">{intro}</p>}
    </header>
  );
}

export function SectionLabel({ children, href, linkText }: { children: string; href?: string; linkText?: string }) {
  return (
    <div className="mb-6 flex items-baseline justify-between border-t border-fg/10 pt-4">
      <h2 className="font-mono text-xs tracking-widest text-fg/50 uppercase">{children}</h2>
      {href && (
        <a href={href} className="font-mono text-xs tracking-widest text-fg/70 uppercase hover:text-plum">
          {linkText ?? "all"} →
        </a>
      )}
    </div>
  );
}
