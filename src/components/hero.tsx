"use client";

// Home hero: Aceternity's webcam pixel grid behind a giant name. It pixelates
// the visitor's camera (asked for on load), falling back to the hero photo with
// blocks that lift around the cursor. A draggable liquid-glass lens bends whatever is behind.

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconCamera, IconCameraOff, IconHandFinger } from "@tabler/icons-react";
import { ShoreWaves } from "@/components/shore-waves";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { WebcamPixelGrid } from "@/components/ui/webcam-pixel-grid";
import { site } from "@/lib/data";

type Cam = "off" | "starting" | "on" | "denied";

export function Hero() {
  const bounds = useRef<HTMLElement>(null);
  const [cam, setCam] = useState<Cam>("starting");
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const onReady = useCallback(() => setCam("on"), []);
  const onError = useCallback(() => setCam("denied"), []);

  const camLabel = {
    off: "Turn on camera",
    starting: "Asking for cameraâ€¦",
    on: "Camera on Â· turn off",
    denied: "Camera blocked Â· try again",
  }[cam];

  return (
    <section ref={bounds} className="relative isolate flex min-h-svh flex-col overflow-hidden">
      <WebcamPixelGrid
        className="absolute inset-0 -z-20"
        cameraOn={cam === "starting" || cam === "on"}
        fallbackImage="/hero.jpg"
        gridCols={narrow ? 26 : 64}
        gridRows={narrow ? 46 : 40}
        colorMode="duotone"
        duoDark="#48284a"
        duoLight="#f5f2ee"
        duoFloor={0.35}
        maxElevation={narrow ? 14 : 24}
        pointerRadius={narrow ? 5 : 8}
        backgroundColor="#f5f2ee"
        borderColor="#48284a"
        borderOpacity={0.06}
        gapRatio={0.08}
        onWebcamReady={onReady}
        onWebcamError={onError}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,transparent_30%,var(--color-canvas)_90%)]" />
      <ShoreWaves className="-z-[5]" />

      <header className="flex items-start justify-between px-5 pt-5 sm:px-8 sm:pt-7">
        <span className="font-mono text-xs font-medium tracking-widest text-fg uppercase">{site.handle}</span>
        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={() => setCam((c) => (c === "on" || c === "starting" ? "off" : "starting"))}
            className="transition-transform duration-150 ease-out active:scale-[0.97]"
            aria-pressed={cam === "on"}
          >
            <LiquidGlass radius={999} bevelDepth={10} scale={28} aberration={5} contentClassName="flex items-center gap-2 px-4 py-2">
              {cam === "on" ? <IconCameraOff className="size-4" /> : <IconCamera className="size-4" />}
              <span className="text-xs text-fg sm:text-sm">{camLabel}</span>
            </LiquidGlass>
          </button>
          <p className="hidden font-mono text-[10px] tracking-widest text-fg/70 uppercase sm:block">
            {cam === "denied" ? "allow the camera in your browser settings" : "your video never leaves your browser"}
          </p>
        </div>
      </header>

      <div className="pointer-events-none relative flex flex-1 flex-col justify-center px-4 sm:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
          className="font-display text-[18vw] leading-[0.92] tracking-tight text-fg uppercase select-none sm:text-[clamp(4rem,15vw,15rem)]"
        >
          Peter
          <br />
          <span className="text-plum">Racz</span>
        </motion.h1>

        <motion.div
          drag
          dragConstraints={bounds}
          dragElastic={0.15}
          dragMomentum
          whileDrag={{ scale: 1.04 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.8 }}
          className="pointer-events-auto absolute top-[18%] right-[8%] z-10 cursor-grab touch-none active:cursor-grabbing sm:top-[22%] sm:right-[14%]"
        >
          <LiquidGlass
            radius={999}
            bevelDepth={40}
            scale={60}
            aberration={14}
            frost={0.3}
            tint={0.06}
            className="size-40 sm:size-60"
            contentClassName="flex size-full items-end justify-center pb-5"
          >
            <span className="flex items-center gap-1 font-mono text-[10px] tracking-widest text-fg/80 uppercase">
              <IconHandFinger className="size-3.5" /> drag me
            </span>
          </LiquidGlass>
        </motion.div>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-32 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:pb-36">
        <p className="max-w-sm text-lg leading-snug text-fg/80">{site.tagline}</p>
        <LiquidGlass radius={999} bevelDepth={10} scale={30} aberration={6} className="self-start sm:self-auto" contentClassName="flex items-center gap-2 px-4 py-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-plum opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-plum" />
          </span>
          <span className="text-xs text-fg sm:text-sm">building ante-app</span>
        </LiquidGlass>
      </div>
    </section>
  );
}
