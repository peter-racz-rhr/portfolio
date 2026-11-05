"use client";

// Picture show-off: a big photo next to a stacked list of names. Hover (or tap)
// a name and the new photo wipes up over the old one. Started from Skiper UI's
// skiper6 idea; the photo gets its own space so it never covers the text.

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useContent } from "@/components/content-provider";
import type { Photo } from "@/lib/content";

const EASE = [0.77, 0, 0.175, 1] as const;

export function HoverGallery({ photos, className }: { photos: Photo[]; className?: string }) {
  const { resolve } = useContent();
  const [active, setActive] = useState(0);
  const current = photos[active] ?? photos[0];
  if (!current) return null;

  return (
    <div
      className={cn(
        "mx-auto grid w-full max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-14",
        className,
      )}
    >
      {/* Photo */}
      <figure className="flex flex-col gap-3" data-edit={`photos.${Math.min(active, photos.length - 1)}`}>
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-lilac/40 sm:aspect-[5/4] lg:aspect-[4/5]">
          <AnimatePresence initial={false}>
            <motion.img
              key={`${active}-${current.image}`}
              src={resolve(current.image)}
              alt={current.name}
              draggable={false}
              className="absolute inset-0 size-full object-cover"
              initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.08 }}
              animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
              exit={{ opacity: 1, transition: { duration: 0, delay: 0.7 } }}
              transition={{ duration: 0.7, ease: EASE }}
            />
          </AnimatePresence>
          <span className="absolute top-4 left-4 rounded-full bg-canvas/85 px-3 py-1 font-mono text-[11px] tracking-widest text-fg uppercase backdrop-blur">
            {String(active + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </span>
        </div>
        <figcaption className="font-mono text-xs tracking-widest text-fg/60 uppercase" aria-live="polite">
          {current.caption}
        </figcaption>
      </figure>

      {/* Names */}
      <ul className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
        {photos.map((p, i) => {
          const on = i === active;
          return (
            <li key={`${i}-${p.name}`} className="shrink-0" data-edit={`photos.${i}`}>
              <button
                type="button"
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-pressed={on}
                className={cn(
                  "group flex items-center gap-3 rounded-full border px-4 py-2 text-left transition-colors duration-200 lg:w-full lg:rounded-none lg:border-0 lg:border-b lg:border-fg/10 lg:px-0 lg:py-3",
                  on ? "border-fg bg-fg text-canvas lg:bg-transparent lg:text-fg" : "border-fg/15 text-fg/35 hover:text-fg/70",
                )}
              >
                <span
                  className={cn(
                    "hidden size-3 shrink-0 rounded-full bg-plum transition-transform duration-200 lg:block",
                    on ? "scale-100" : "scale-0",
                  )}
                />
                <span className="font-display text-sm whitespace-nowrap uppercase lg:text-[clamp(1.6rem,3.2vw,2.75rem)] lg:leading-none">
                  {p.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
