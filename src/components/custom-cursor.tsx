"use client";

// Plum dot that sticks to the pointer plus a ring that trails it on a spring.
// The ring grows over links/buttons and reads "drag" over draggable things.
// Mouse and trackpad only; touch devices keep their normal behaviour.

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

type Mode = "default" | "link" | "drag" | "text";

const DRAG = ".cursor-grab, [data-cursor='drag']";
const LINK = "a, button, label, select, [role='button']";
const TEXT = "input, textarea, [contenteditable='true']";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("default");
  const [visible, setVisible] = useState(false);
  const [down, setDown] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 350, damping: 30, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 350, damping: 30, mass: 0.6 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-custom-cursor");

    const modeAt = (t: Element | null): Mode =>
      t?.closest(TEXT) ? "text" : t?.closest(DRAG) ? "drag" : t?.closest(LINK) ? "link" : "default";
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      setMode(modeAt(e.target as Element | null));
    };
    // content scrolls under a still pointer, so re-check what's beneath it
    const scroll = () => setMode(modeAt(document.elementFromPoint(x.get(), y.get())));
    const leave = () => setVisible(false);
    const press = () => setDown(true);
    const release = () => setDown(false);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("pointerup", release);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("pointerup", release);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const ring = { default: 34, link: 56, drag: 76, text: 0 }[mode];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200]">
      <motion.div
        style={{ x: rx, y: ry }}
        className="absolute top-0 left-0"
        animate={{ opacity: visible && mode !== "text" ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-plum/60"
          animate={{
            width: ring,
            height: ring,
            backgroundColor: mode === "drag" ? "rgba(72,40,74,0.92)" : mode === "link" ? "rgba(72,40,74,0.12)" : "rgba(72,40,74,0)",
            scale: down ? 0.85 : 1,
          }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
        >
          {mode === "drag" && (
            <span className="font-mono text-[10px] tracking-widest text-canvas uppercase">drag</span>
          )}
        </motion.div>
      </motion.div>
      <motion.div
        style={{ x, y }}
        className="absolute top-0 left-0"
        animate={{ opacity: visible && mode !== "drag" && mode !== "text" ? 1 : 0 }}
        transition={{ duration: 0.1 }}
      >
        <div className="size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-plum" />
      </motion.div>
    </div>
  );
}
