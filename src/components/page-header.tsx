import { T } from "@/components/content-provider";

/** Page title block. `titlePath`/`introPath` point into the site content so the editor can change them. */
export function PageHeader({ eyebrow, titlePath, introPath }: { eyebrow: React.ReactNode; titlePath: string; introPath?: string }) {
  return (
    <header className="px-5 pt-20 pb-12 sm:px-8 sm:pt-28">
      <p className="font-mono text-xs tracking-widest text-plum uppercase">{eyebrow}</p>
      <T
        path={titlePath}
        as="h1"
        className="mt-3 block font-display text-[clamp(2.2rem,9vw,7rem)] leading-[0.95] tracking-tight uppercase"
      />
      {introPath && <T path={introPath} as="p" multiline className="mt-6 block max-w-xl text-lg text-fg/70" />}
    </header>
  );
}

export function SectionLabel({
  children,
  path,
  href,
  linkText,
}: {
  children?: string;
  /** content path for an editable label; otherwise `children` is shown */
  path?: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="mb-6 flex items-baseline justify-between border-t border-fg/10 pt-4">
      <h2 className="font-mono text-xs tracking-widest text-fg/50 uppercase">{path ? <T path={path} /> : children}</h2>
      {href && (
        <a href={href} className="font-mono text-xs tracking-widest text-fg/70 uppercase hover:text-plum">
          {linkText ?? "all"} →
        </a>
      )}
    </div>
  );
}
