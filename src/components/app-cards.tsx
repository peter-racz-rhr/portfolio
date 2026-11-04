"use client";

// App showcase after Skiper UI's skiper23 (minimal card expand): colored
// tiles that grow into a detail card with a shared layout animation.
// Click outside or press Escape to collapse.

import { AnimatePresence, motion } from "motion/react";
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
import type { Project } from "@/lib/data";

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
        {projects.map((p) => {
          const Icon = ICONS[p.icon];
          return (
            <li key={p.slug} className="aspect-[5/3] sm:aspect-[4/3]">
              {active?.slug === p.slug ? (
                <div className="size-full rounded-3xl bg-fg/5" />
              ) : (
                <motion.button
                  type="button"
                  layoutId={`card-${p.slug}`}
                  transition={SPRING}
                  onClick={() => setActive(p)}
                  style={{ backgroundColor: p.color, color: inkFor(p.color), borderRadius: 24 }}
                  className="group relative flex size-full flex-col justify-between p-4 text-left active:scale-[0.98] sm:p-5"
                >
                  <div className="flex w-full items-start justify-between">
                    <motion.span layoutId={`icon-${p.slug}`} transition={SPRING}>
                      <Icon className="size-7 sm:size-8" stroke={1.8} />
                    </motion.span>
                    <span className="flex size-7 items-center justify-center rounded-full bg-current/10 transition-colors duration-150 group-hover:bg-current/20">
                      <IconDots className="size-4" />
                    </span>
                  </div>
                  <div>
                    <motion.h3
                      layoutId={`title-${p.slug}`}
                      transition={SPRING}
                      className="font-display text-xl leading-tight uppercase sm:text-2xl"
                    >
                      {p.name}
                    </motion.h3>
                    <p className="mt-1.5 text-sm opacity-70">{p.blurb}</p>
                  </div>
                </motion.button>
              )}
            </li>
          );
        })}
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
      style={{ backgroundColor: p.color, color: inkFor(p.color), borderRadius: 32 }}
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
