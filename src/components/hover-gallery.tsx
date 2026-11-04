"use client";

// Picture show-off after Skiper UI's skiper6 (hover members): a row of
// thumbnails, a giant name that re-spells itself on hover, and a preview
// that trails the cursor. Tap works on touch screens.

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Photo } from "@/lib/data";

export function HoverGallery({
  photos,
  defaultName = "Gallery",
  className,
}: {
  photos: Photo[];
  defaultName?: string;
  className?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 30, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 300, damping: 30, mass: 0.5 });

  const current = active === null ? null : photos[active];
  const label = current?.name ?? defaultName;

  return (
    <div
      className={cn("relative flex flex-col items-center gap-10 overflow-hidden py-16", className)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
    >
      <ul className="relative z-10 flex flex-wrap justify-center gap-2 sm:gap-3">
        {photos.map((p, i) => (
          <li key={p.name}>
            <button
              type="button"
              aria-label={p.name}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
              onClick={() => setActive((a) => (a === i ? null : i))}
              className={cn(
                "block size-12 overflow-hidden rounded-lg ring-1 ring-fg/10 transition-[transform,filter] duration-200 ease-out active:scale-95 sm:size-16",
                active !== null && active !== i ? "grayscale brightness-50" : "",
                active === i && "-translate-y-1 ring-plum",
              )}
            >
              <img src={p.image} alt="" className="size-full object-cover" draggable={false} />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative z-0 h-[1em] text-[clamp(2rem,10.5vw,9rem)] leading-none">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.h2
            key={label}
            className="flex font-display tracking-tight text-fg uppercase"
            aria-live="polite"
          >
            {label.split("").map((ch, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.05em]">
                <motion.span
                  className="inline-block"
                  initial={{ y: "100%" }}
                  animate={{ y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: i * 0.025 } }}
                  exit={{ y: "-100%", transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1], delay: i * 0.015 } }}
                >
                  {ch === " " ? " " : ch}
                </motion.span>
              </span>
            ))}
          </motion.h2>
        </AnimatePresence>
      </div>

      <p className="h-5 font-mono text-xs tracking-widest text-fg/50 uppercase">
        {current ? current.caption : "hover or tap a picture"}
      </p>

      {/* cursor-trailing preview, mouse only */}
      <motion.div
        aria-hidden
        style={{ x: sx, y: sy }}
        className="pointer-events-none absolute top-0 left-0 z-20 hidden [@media(hover:hover)]:block"
      >
        <AnimatePresence>
          {current && (
            <motion.img
              key={current.name}
              src={current.image}
              alt=""
              initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="absolute top-6 left-6 h-56 w-44 max-w-none rounded-xl object-cover shadow-2xl ring-1 ring-fg/10"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
