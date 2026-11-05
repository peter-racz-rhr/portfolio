"use client";

// Scroll-linked word-by-word reveal, after Skiper UI's skiper70: each word
// gets a highlight box that sweeps in, then the word itself fades up.

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { T, useContent } from "@/components/content-provider";
import { getAt } from "@/lib/content";
import { cn } from "@/lib/utils";

const BASE = "flex flex-wrap font-sans text-3xl font-semibold leading-[1.15] tracking-tight sm:text-5xl";

/** Reads its text from `path` in the site content; inside the editor it's a plain editable paragraph. */
export function TextReveal({ path, highlight = [], className }: { path: string; highlight?: string[]; className?: string }) {
  const { content, editing } = useContent();
  if (editing) return <T path={path} as="p" multiline className={cn(BASE, "block", className)} />;
  const text = String(getAt(content, path) ?? "");
  return <Reveal text={text} highlight={highlight} className={className} />;
}

function Reveal({ text, highlight, className }: { text: string; highlight: string[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.55"] });
  const words = text.split(/\s+/);
  const marked = new Set(highlight.map((w) => w.toLowerCase()));

  return (
    <p
      ref={ref}
      className={cn(BASE, className)}
    >
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word
            key={i}
            progress={scrollYProgress}
            range={[start, end]}
            hot={marked.has(word.toLowerCase().replace(/[^\p{L}\d-]/gu, ""))}
          >
            {word}
          </Word>
        );
      })}
    </p>
  );
}

function Word({
  children,
  progress,
  range: [start, end],
  hot,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  hot: boolean;
}) {
  const mid = start + (end - start) / 2;
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  const box = useTransform(progress, [start, mid, end], [0, 1, hot ? 1 : 0]);
  const boxScale = useTransform(progress, [start, mid], [0.6, 1]);

  return (
    <span className="relative mr-[0.25em] mb-[0.08em] inline-block">
      <motion.span
        aria-hidden
        style={{ opacity: box, scaleX: boxScale }}
        className={cn(
          "absolute -inset-x-[0.08em] inset-y-[0.06em] origin-left rounded-[0.12em]",
          hot ? "bg-plum" : "bg-fg/15",
        )}
      />
      <motion.span style={{ opacity }} className={cn("relative", hot && "text-canvas")}>
        {children}
      </motion.span>
    </span>
  );
}
