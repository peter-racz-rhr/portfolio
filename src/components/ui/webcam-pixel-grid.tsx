"use client";
/**
 * Aceternity UI webcam pixel grid, adapted:
 * - the camera only starts when `cameraOn` is true (no prompt on page load)
 * - without the camera it pixelates `fallbackImage` and lifts cells near the pointer
 * - camera errors go to `onWebcamError`; the page draws its own UI
 * - the loop pauses while the grid is off screen
 * - "duotone" maps brightness between two colors (`duoDark` → `duoLight`)
 */
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

type WebcamPixelGridProps = {
  cameraOn?: boolean;
  fallbackImage?: string;
  gridCols?: number;
  gridRows?: number;
  maxElevation?: number;
  motionSensitivity?: number;
  elevationSmoothing?: number;
  /** Pointer lift radius in cells (image mode) */
  pointerRadius?: number;
  colorMode?: "webcam" | "monochrome" | "duotone";
  duoDark?: string;
  duoLight?: string;
  /** Duotone: where on the dark→light ramp the darkest pixel lands (0-1) */
  duoFloor?: number;
  monochromeColor?: string;
  backgroundColor?: string;
  mirror?: boolean;
  gapRatio?: number;
  darken?: number;
  borderColor?: string;
  borderOpacity?: number;
  className?: string;
  onWebcamError?: (error: Error) => void;
  onWebcamReady?: () => void;
};

type PixelData = { r: number; g: number; b: number; motion: number; currentElevation: number };

const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
};

export const WebcamPixelGrid: React.FC<WebcamPixelGridProps> = ({
  cameraOn = false,
  fallbackImage,
  gridCols = 64,
  gridRows = 40,
  maxElevation = 15,
  motionSensitivity = 0.4,
  elevationSmoothing = 0.12,
  pointerRadius = 6,
  colorMode = "webcam",
  monochromeColor = "#00ff88",
  duoDark = "#48284a",
  duoLight = "#f5f2ee",
  duoFloor = 0,
  backgroundColor = "#0a0a0a",
  mirror = true,
  gapRatio = 0.1,
  darken = 0,
  borderColor = "#ffffff",
  borderOpacity = 0.08,
  className,
  onWebcamError,
  onWebcamReady,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const procRef = useRef<HTMLCanvasElement>(null);
  const displayRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const pixelsRef = useRef<PixelData[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const liveRef = useRef(false);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const visibleRef = useRef(true);
  const rafRef = useRef(0);

  const monoRGB = useMemo(() => hexToRgb(monochromeColor), [monochromeColor]);
  const borderRGB = useMemo(() => hexToRgb(borderColor), [borderColor]);
  const darkRGB = useMemo(() => hexToRgb(duoDark), [duoDark]);
  const lightRGB = useMemo(() => hexToRgb(duoLight), [duoLight]);

  useEffect(() => {
    pixelsRef.current = Array.from({ length: gridRows * gridCols }, () => ({
      r: 30, g: 30, b: 30, motion: 0, currentElevation: 0,
    }));
    prevFrameRef.current = null;
  }, [gridCols, gridRows]);

  // Fallback image (must be same-origin so its pixels can be read)
  useEffect(() => {
    if (!fallbackImage) return;
    const img = new Image();
    img.src = fallbackImage;
    img.onload = () => (imageRef.current = img);
    return () => {
      imageRef.current = null;
    };
  }, [fallbackImage]);

  // Camera on/off
  useEffect(() => {
    if (!cameraOn) return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        });
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        prevFrameRef.current = null;
        liveRef.current = true;
        onWebcamReady?.();
      } catch (err) {
        if (!cancelled) onWebcamError?.(err instanceof Error ? err : new Error("Camera access denied"));
      }
    })();
    return () => {
      cancelled = true;
      liveRef.current = false;
      prevFrameRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [cameraOn, onWebcamError, onWebcamReady]);

  // Pointer position (image mode) and visibility
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const r = displayRef.current?.getBoundingClientRect();
      if (!r) return;
      pointerRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => (pointerRef.current = null);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    const io = new IntersectionObserver(([entry]) => (visibleRef.current = entry.isIntersecting));
    if (rootRef.current) io.observe(rootRef.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      io.disconnect();
    };
  }, []);

  const render = useCallback(() => {
    rafRef.current = requestAnimationFrame(render);
    if (!visibleRef.current) return;

    const proc = procRef.current;
    const display = displayRef.current;
    const video = videoRef.current;
    const live = liveRef.current && video && video.readyState >= 2;
    const source: CanvasImageSource | null = live ? video : imageRef.current;
    if (!proc || !display || !source) return;

    const procCtx = proc.getContext("2d", { willReadFrequently: true });
    const ctx = display.getContext("2d");
    if (!procCtx || !ctx) return;

    proc.width = gridCols;
    proc.height = gridRows;

    // Draw the source scaled down, cropped to the grid's aspect (object-fit: cover)
    const sw = live ? (source as HTMLVideoElement).videoWidth : (source as HTMLImageElement).naturalWidth;
    const sh = live ? (source as HTMLVideoElement).videoHeight : (source as HTMLImageElement).naturalHeight;
    const target = gridCols / gridRows;
    let cw = sw, ch = sh;
    if (sw / sh > target) cw = sh * target;
    else ch = sw / target;
    const cx = (sw - cw) / 2, cy = (sh - ch) / 2;

    procCtx.save();
    if (live && mirror) {
      procCtx.scale(-1, 1);
      procCtx.drawImage(source, cx, cy, cw, ch, -gridCols, 0, gridCols, gridRows);
    } else {
      procCtx.drawImage(source, cx, cy, cw, ch, 0, 0, gridCols, gridRows);
    }
    procCtx.restore();

    const data = procCtx.getImageData(0, 0, gridCols, gridRows).data;
    const prev = prevFrameRef.current;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = display.clientWidth;
    const h = display.clientHeight;
    if (display.width !== Math.round(w * dpr) || display.height !== Math.round(h * dpr)) {
      display.width = Math.round(w * dpr);
      display.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cell = Math.max(w / gridCols, h / gridRows);
    const gap = cell * gapRatio;
    const ox = (w - cell * gridCols) / 2;
    const oy = (h - cell * gridRows) / 2;

    const p = pointerRef.current;
    const pc = p ? { col: (p.x - ox) / cell, row: (p.y - oy) / cell } : null;

    const pixels = pixelsRef.current;
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const i = row * gridCols + col;
        const idx = i * 4;
        const px = pixels[i];
        if (!px) continue;
        let r = data[idx], g = data[idx + 1], b = data[idx + 2];

        let motion = 0;
        if (live) {
          if (prev) {
            const diff = Math.abs(r - prev[idx]) + Math.abs(g - prev[idx + 1]) + Math.abs(b - prev[idx + 2]);
            motion = Math.min(1, diff / 255 / motionSensitivity);
          }
        } else if (pc) {
          const d = Math.hypot(col + 0.5 - pc.col, row + 0.5 - pc.row);
          motion = Math.max(0, 1 - d / pointerRadius) ** 1.5;
        }
        px.motion = px.motion * 0.7 + motion * 0.3;

        if (colorMode === "monochrome") {
          const br = (r + g + b) / 3 / 255;
          r = monoRGB.r * br; g = monoRGB.g * br; b = monoRGB.b * br;
        } else if (colorMode === "duotone") {
          const t = duoFloor + (1 - duoFloor) * ((r + g + b) / 3 / 255);
          r = darkRGB.r + (lightRGB.r - darkRGB.r) * t;
          g = darkRGB.g + (lightRGB.g - darkRGB.g) * t;
          b = darkRGB.b + (lightRGB.b - darkRGB.b) * t;
        }
        const k = 1 - darken;
        px.r = Math.round(r * k);
        px.g = Math.round(g * k);
        px.b = Math.round(b * k);
        px.currentElevation += (px.motion * maxElevation - px.currentElevation) * elevationSmoothing;
      }
    }
    prevFrameRef.current = new Uint8ClampedArray(data);

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, w, h);

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const px = pixels[row * gridCols + col];
        if (!px) continue;
        const x = ox + col * cell;
        const y = oy + row * cell;
        const e = px.currentElevation;
        const dx = -e * 1.2;
        const dy = -e * 1.8;
        const s = cell - gap;
        const g2 = gap / 2;

        if (e > 0.5) {
          ctx.fillStyle = `rgba(0,0,0,${Math.min(0.6, e * 0.04)})`;
          ctx.fillRect(x + g2 + e * 1.5, y + g2 + e * 2, s, s);

          ctx.fillStyle = `rgb(${Math.max(0, px.r - 80)},${Math.max(0, px.g - 80)},${Math.max(0, px.b - 80)})`;
          ctx.beginPath();
          ctx.moveTo(x + cell - g2 + dx, y + g2 + dy);
          ctx.lineTo(x + cell - g2, y + g2);
          ctx.lineTo(x + cell - g2, y + cell - g2);
          ctx.lineTo(x + cell - g2 + dx, y + cell - g2 + dy);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = `rgb(${Math.max(0, px.r - 50)},${Math.max(0, px.g - 50)},${Math.max(0, px.b - 50)})`;
          ctx.beginPath();
          ctx.moveTo(x + g2 + dx, y + cell - g2 + dy);
          ctx.lineTo(x + g2, y + cell - g2);
          ctx.lineTo(x + cell - g2, y + cell - g2);
          ctx.lineTo(x + cell - g2 + dx, y + cell - g2 + dy);
          ctx.closePath();
          ctx.fill();
        }

        const br = 1 + e * 0.05;
        ctx.fillStyle = `rgb(${Math.min(255, Math.round(px.r * br))},${Math.min(255, Math.round(px.g * br))},${Math.min(255, Math.round(px.b * br))})`;
        ctx.fillRect(x + g2 + dx, y + g2 + dy, s, s);
        ctx.strokeStyle = `rgba(${borderRGB.r},${borderRGB.g},${borderRGB.b},${borderOpacity + e * 0.008})`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x + g2 + dx, y + g2 + dy, s, s);
      }
    }
  }, [
    gridCols, gridRows, mirror, motionSensitivity, pointerRadius, colorMode, monoRGB, darkRGB, lightRGB, duoFloor, maxElevation,
    elevationSmoothing, backgroundColor, gapRatio, darken, borderRGB, borderOpacity,
  ]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  return (
    <div ref={rootRef} className={cn("relative h-full w-full", className)}>
      <video ref={videoRef} className="pointer-events-none absolute h-0 w-0 opacity-0" playsInline muted />
      <canvas ref={procRef} className="pointer-events-none absolute h-0 w-0 opacity-0" />
      <canvas ref={displayRef} className="h-full w-full" style={{ backgroundColor }} />
    </div>
  );
};

export default WebcamPixelGrid;
