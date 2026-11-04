"use client";

// Words preloader in the spirit of Skiper UI's skiper8: greetings flash by,
// then the curtain lifts with a curved bottom edge. Plays once per session.

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const WORDS = ["Hello", "Szia", "Hallo", "Ciao", "Hola", "Bonjour", "Hej", "こんにちは", "Peter here"];
const EASE = [0.76, 0, 0.24, 1] as const;
const KEY = "intro-seen";

export function IntroPreloader() {
  const [show, setShow] = useState(true);
  const [skip, setSkip] = useState(false);
  const [index, setIndex] = useState(0);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSkip(true);
      setShow(false);
      return;
    }
    setSize({ w: window.innerWidth, h: window.innerHeight });
  }, []);

  useEffect(() => {
    if (!show || skip || size.w === 0) return;
    if (index === WORDS.length - 1) {
      const t = setTimeout(() => {
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {}
        setShow(false);
      }, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setIndex((i) => i + 1), index === 0 ? 900 : 160);
    return () => clearTimeout(t);
  }, [index, show, skip, size.w]);

  useEffect(() => {
    document.documentElement.style.overflow = show ? "hidden" : "";
  }, [show]);

  const { w, h } = size;
  const curved = `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h + 300} 0 ${h} L0 0`;
  const flat = `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h} 0 ${h} L0 0`;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ y: 0 }}
          exit={skip ? { opacity: 0, transition: { duration: 0 } } : { y: "-100vh", transition: { duration: 0.8, ease: EASE, delay: 0.1 } }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Solid fill until the SVG is measured, so nothing flashes behind */}
          {w === 0 && <div className="absolute inset-0 bg-canvas" />}
          {w > 0 && (
            <svg className="pointer-events-none absolute top-0 left-0 h-[calc(100%+300px)] w-full overflow-visible">
              <motion.path
                className="fill-canvas"
                initial={{ d: curved }}
                exit={{ d: flat, transition: { duration: 0.8, ease: EASE, delay: 0.25 } }}
              />
            </svg>
          )}
          {w > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85, transition: { duration: 0.8, delay: 0.2 } }}
              className="relative z-10 flex items-center gap-3 font-display text-3xl text-fg uppercase sm:text-5xl"
            >
              <span className="size-2.5 rounded-full bg-plum sm:size-3" />
              {WORDS[index]}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
