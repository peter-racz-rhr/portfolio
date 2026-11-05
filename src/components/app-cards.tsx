"use client";

// App showcase after Skiper UI's skiper23 (minimal card expand): colored
// tiles that grow into a detail card with a shared layout animation.
// Click outside or press Escape to collapse. On hover (mouse only) a card tilts
// toward the cursor with a glare, its title letters hop, a big ghost icon spins
// in and the dots stretch into "Open".

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useState } from "react";
import {
  IconArrowUpRight,
  IconBook,
  IconBrandGithub,
  IconCube,
  IconDots,
  IconSparkles,
  IconSun,
  IconTerminal2,
  IconWorld,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/content";

const ICONS = {
  sparkles: IconSparkles,
  sun: IconSun,
  book: IconBook,
  terminal: IconTerminal2,
  globe: IconWorld,
  cube: IconCube,
};

const SPRING = { type: "spring", duration: 0.45, bounce: 0.12 } as const;

// Light text on dark cards, dark text on light ones
const DARK = "#1b1419";
const LIGHT = "#f5f2ee";
function inkFor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? DARK : LIGHT;
}

const STATUS_DOT: Record<Project["status"], string> = {
  building: "animate-pulse",
  shipped: "",
  paused: "opacity-40",
};

function Card({
  project: p,
  index,
  placeholder,
  onOpen,
}: {
  project: Project;
  index: number;
  placeholder: boolean;
  onOpen: () => void;
}) {
  const Icon = ICONS[p.icon];
  const ink = inkFor(p.color);
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);

  // pointer position over the card, 0–1 on each axis
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const tilt = { stiffness: 220, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(my, [0, 1], [9, -9]), tilt);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-11, 11]), tilt);
  const glareX = useTransform(mx, (v) => `${v * 100}%`);
  const glareY = useTransform(my, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgb(255 255 255 / 0.28), transparent 55%)`;

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
    setHover(true);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    setHover(false);
  };

  return (
    <motion.li
      className="aspect-[5/3] [perspective:900px] sm:aspect-[4/3]"
      data-edit={`projects.${index}`}
      initial={reduce ? false : { opacity: 0, y: 48, rotate: index % 2 ? 3 : -3 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", duration: 0.8, bounce: 0.35, delay: (index % 3) * 0.08 }}
    >
      {placeholder ? (
        <div className="size-full rounded-3xl bg-fg/5" />
      ) : (
        <motion.div
          className="size-full rounded-3xl"
          style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
          animate={{
            y: hover ? -8 : 0,
            boxShadow: hover ? `0 34px 50px -26px ${p.color}` : "0 0px 0px 0px rgb(0 0 0 / 0)",
          }}
          transition={{ type: "spring", duration: 0.45, bounce: 0.3 }}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
        >
          <motion.button
            type="button"
            layoutId={`card-${p.slug}`}
            transition={SPRING}
            onClick={() => {
              onLeave();
              onOpen();
            }}
            aria-label={`${p.name}: ${p.blurb}`}
            style={{ backgroundColor: p.color, color: ink, borderRadius: 24 }}
            className="group relative flex size-full flex-col justify-between overflow-hidden p-4 text-left active:scale-[0.98] sm:p-5"
          >
            {/* big ghost icon that spins in from the corner */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -right-10 -bottom-12"
              initial={false}
              animate={
                hover
                  ? { x: 0, y: 0, rotate: -14, scale: 1, opacity: 0.16 }
                  : { x: 28, y: 28, rotate: 12, scale: 0.75, opacity: 0.07 }
              }
              transition={{ type: "spring", duration: 0.7, bounce: 0.35 }}
            >
              <Icon className="size-48 sm:size-56" stroke={1.2} />
            </motion.span>

            {/* glare that follows the cursor */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: glare }}
              animate={{ opacity: hover ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            />

            <div className="relative flex w-full items-start justify-between gap-2">
              {/* outer span carries the open-card layout move; inner one wiggles on hover */}
              <motion.span layoutId={`icon-${p.slug}`} transition={SPRING} className="block">
                <motion.span
                  className="block"
                  initial={false}
                  animate={hover && !reduce ? { rotate: [0, -16, 12, 0], scale: [1, 1.18, 1.1, 1.12] } : { rotate: 0, scale: 1 }}
                  transition={hover && !reduce ? { duration: 0.6, ease: "easeInOut" } : { duration: 0.25 }}
                >
                  <Icon className="size-7 sm:size-8" stroke={1.8} />
                </motion.span>
              </motion.span>
              <div className="flex items-center gap-2">
                <motion.span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] tracking-widest uppercase"
                  style={{ backgroundColor: ink, color: p.color }}
                  initial={false}
                  animate={{ rotate: hover ? 4 : -5, y: hover ? -2 : 0 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0.55 }}
                >
                  <span className={cn("size-1.5 rounded-full bg-current", STATUS_DOT[p.status])} />
                  {p.status}
                </motion.span>
                <span className="flex h-7 items-center rounded-full bg-current/10 px-1.5 transition-colors duration-150 group-hover:bg-current/20">
                  <IconDots className="size-4 transition-transform duration-300 group-hover:rotate-90" />
                  <span className="max-w-0 overflow-hidden text-xs font-semibold whitespace-nowrap opacity-0 transition-[max-width,opacity,padding] duration-300 ease-out group-hover:max-w-16 group-hover:px-1 group-hover:opacity-100">
                    Open ↗
                  </span>
                </span>
              </div>
            </div>

            <div className="relative">
              <motion.h3
                layoutId={`title-${p.slug}`}
                transition={SPRING}
                className="font-display text-xl leading-tight uppercase sm:text-2xl"
              >
                <BouncyText text={p.name} play={hover && !reduce} />
              </motion.h3>
              <p className="mt-1.5 text-sm opacity-70">{p.blurb}</p>
            </div>
          </motion.button>
        </motion.div>
      )}
    </motion.li>
  );
}

/* Letters hop one after another while `play` is on */
function BouncyText({ text, play }: { text: string; play: boolean }) {
  return (
    <span aria-hidden className="inline-flex flex-wrap">
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          animate={play ? { y: [0, -9, 0] } : { y: 0 }}
          transition={play ? { duration: 0.42, ease: [0.33, 1, 0.68, 1], delay: i * 0.035 } : { duration: 0.2 }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}

export function AppCards({ projects, className }: { projects: Project[]; className?: string }) {
  const [active, setActive] = useState<Project | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <>
      <ul className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3", className)}>
        {projects.map((p, i) => (
          <Card key={p.slug} project={p} index={i} placeholder={active?.slug === p.slug} onOpen={() => setActive(p)} />
        ))}
      </ul>

      <AnimatePresence>
        {active && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              onClick={() => setActive(null)}
              className="fixed inset-0 z-40 bg-canvas/70 backdrop-blur-sm"
            />
            <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4">
              <Expanded project={active} onClose={() => setActive(null)} />
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Expanded({ project: p, onClose }: { project: Project; onClose: () => void }) {
  const Icon = ICONS[p.icon];
  return (
    <motion.div
      layoutId={`card-${p.slug}`}
      transition={SPRING}
      style={{ backgroundColor: p.color, color: inkFor(p.color), borderRadius: 24 }}
      className="pointer-events-auto w-full max-w-lg overflow-hidden p-6 sm:p-8"
      role="dialog"
      aria-label={p.name}
    >
      <div className="flex items-start justify-between">
        <motion.span layoutId={`icon-${p.slug}`} transition={SPRING}>
          <Icon className="size-10" stroke={1.8} />
        </motion.span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-9 items-center justify-center rounded-full bg-current/10 transition-transform duration-150 ease-out hover:bg-current/20 active:scale-95"
        >
          <IconX className="size-4" />
        </button>
      </div>
      <motion.h3 layoutId={`title-${p.slug}`} transition={SPRING} className="mt-8 font-display text-2xl leading-tight uppercase sm:text-3xl">
        {p.name}
      </motion.h3>
      <motion.div
        initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: 0.12, duration: 0.3 } }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
      >
        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-wider uppercase">
          <span className="rounded-full px-2.5 py-1" style={{ backgroundColor: inkFor(p.color), color: p.color }}>{p.status}</span>
          <span className="opacity-60">{p.year}</span>
          {p.stack.map((s) => (
            <span key={s} className="rounded-full border border-current/25 px-2.5 py-1">
              {s}
            </span>
          ))}
        </div>
        <p className="mt-5 text-base leading-relaxed opacity-80">{p.description}</p>
        <div className="mt-7 flex gap-2">
          <a
            href={p.repo}
            target="_blank"
            rel="noreferrer"
            style={{ backgroundColor: inkFor(p.color), color: p.color }}
            className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            <IconBrandGithub className="size-4" /> Code
          </a>
          {p.live && (
            <a
              href={p.live}
              className="flex items-center gap-1.5 rounded-full border border-current/30 px-4 py-2.5 text-sm transition-transform duration-150 ease-out active:scale-[0.97]"
            >
              Live <IconArrowUpRight className="size-4" />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
