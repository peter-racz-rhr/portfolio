"use client";

// Picture show-off: a big photo next to a stacked list of names. Hover (or tap)
// a name and the new photo wipes up over the old one. Started from Skiper UI's
// skiper6 idea; the photo gets its own space so it never covers the text.
//
// On phones the gallery pins to the screen while you scroll: each stretch of
// vertical scrolling flips to the next photo, and once the last one is showing
// the pin lets go and the page carries on scrolling.

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useContent } from "@/components/content-provider";
import type { Photo } from "@/lib/content";

const EASE = [0.77, 0, 0.175, 1] as const;
// How much vertical scroll (in % of the screen height) each photo gets on phones.
const STEP_SVH = 55;

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

export function HoverGallery({ photos, className }: { photos: Photo[]; className?: string }) {
  const { resolve, editing } = useContent();
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();
  const pinned = isMobile && !editing && photos.length > 1;

  const trackRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!pinned) return;
    // Each photo owns the stretch around its stop point (see the snap points below).
    const i = Math.min(photos.length - 1, Math.max(0, Math.round(v * (photos.length - 1))));
    setActive((prev) => (prev === i ? prev : i));
  });

  // Keep the active name pill in view in the sideways list.
  useEffect(() => {
    const list = pillsRef.current;
    const pill = list?.children[active] as HTMLElement | undefined;
    if (!list || !pill || !isMobile) return;
    list.scrollTo({ left: pill.offsetLeft - (list.clientWidth - pill.offsetWidth) / 2, behavior: "smooth" });
  }, [active, isMobile]);

  // Tapping a name while pinned scrolls the page to that photo's stretch.
  const pick = (i: number) => {
    const track = trackRef.current;
    if (!pinned || !track) return setActive(i);
    const top = track.getBoundingClientRect().top + window.scrollY;
    const travel = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + travel * (i / (photos.length - 1)), behavior: "smooth" });
  };

  // Let the page snap to the photos' stop points while the gallery is pinned.
  // Proximity (not mandatory) so the rest of the page scrolls freely.
  useEffect(() => {
    if (!pinned) return;
    const root = document.documentElement;
    root.style.scrollSnapType = "y proximity";
    return () => {
      root.style.scrollSnapType = "";
    };
  }, [pinned]);

  const current = photos[active] ?? photos[0];
  if (!current) return null;

  const gallery = (
    <div
      className={cn(
        "mx-auto grid w-full max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-14",
        pinned && "gap-5",
        className,
        pinned && "py-0",
      )}
    >
      {/* Photo */}
      <figure className="flex flex-col gap-3" data-edit={`photos.${Math.min(active, photos.length - 1)}`}>
        <div
          className={cn(
            "skeleton relative aspect-[4/5] w-full overflow-hidden rounded-3xl sm:aspect-[5/4] lg:aspect-[4/5]",
            pinned && "max-h-[58svh]",
          )}
        >
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
      <ul ref={pillsRef} className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
        {photos.map((p, i) => {
          const on = i === active;
          return (
            <li key={`${i}-${p.name}`} className="shrink-0" data-edit={`photos.${i}`}>
              <button
                type="button"
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                onFocus={() => !pinned && setActive(i)}
                onClick={() => pick(i)}
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

  // The track is always rendered so the scroll tracker has an element from the
  // first render; it only gets its extra height and sticky pin on phones.
  return (
    <div
      ref={trackRef}
      className="relative"
      style={pinned ? { height: `calc(100dvh + ${(photos.length - 1) * STEP_SVH}svh)` } : undefined}
    >
      {/* One stop point per photo. snap-stop "always" means a fast swipe can't fly
          past a photo: every swipe lands on the next one and rests there. */}
      {pinned &&
        photos.map((_, i) => (
          <div
            key={i}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 h-px snap-start snap-always"
            style={{ top: `${i * STEP_SVH}svh` }}
          />
        ))}
      <div className={cn(pinned && "sticky top-0 flex h-dvh flex-col justify-center")}>{gallery}</div>
    </div>
  );
}
