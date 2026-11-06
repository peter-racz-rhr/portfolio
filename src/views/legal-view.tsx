"use client";

// Privacy policy and legal notice, with a Hungarian / English switch.
// The texts live in src/content/legal.tsx.

import { useState } from "react";
import { cn } from "@/lib/utils";
import { EFFECTIVE, NOTICE, PRIVACY, type Lang, type LegalDoc } from "@/content/legal";

const DOCS = { privacy: PRIVACY, notice: NOTICE } satisfies Record<string, Record<Lang, LegalDoc>>;

export function LegalView({ doc }: { doc: keyof typeof DOCS }) {
  const [lang, setLang] = useState<Lang>("hu");

  const d = DOCS[doc][lang];
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pt-20 pb-12 sm:px-8 sm:pt-28" lang={lang}>
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-xs tracking-widest text-plum uppercase">{d.eyebrow}</p>
        <div className="flex rounded-full border border-fg/15 p-0.5 font-mono text-[11px] tracking-widest uppercase">
          {(["hu", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={cn("rounded-full px-3 py-1 transition-colors", lang === l ? "bg-fg text-canvas" : "text-fg/50")}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <h1 className="mt-3 font-display text-[clamp(2rem,8vw,4.5rem)] leading-[0.95] tracking-tight uppercase">{d.title}</h1>
      <p className="mt-4 font-mono text-[11px] tracking-widest text-fg/40 uppercase">
        {lang === "hu" ? "Hatályos: " : "Effective: "}
        {EFFECTIVE[lang]}
      </p>
      <div className="mt-8 space-y-3 text-lg text-fg/75">{d.intro}</div>
      <div className="mt-12 space-y-10">
        {d.sections.map((s) => (
          <section key={s.title} className="border-t border-fg/10 pt-5">
            <h2 className="font-mono text-xs tracking-widest text-fg/60 uppercase">{s.title}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-fg/80">{s.body}</div>
          </section>
        ))}
      </div>
    </main>
  );
}
