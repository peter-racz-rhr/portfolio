"use client";

// Picks a background color from an album cover: the cover's main color, leaning
// toward its most colorful parts, then darkened enough for light text on top.
// Falls back to `fallback` when the picture can't be read (e.g. a host that
// doesn't allow it).

import { useEffect, useState } from "react";

const cache = new Map<string, string>();
const SIZE = 24; // sample a tiny copy; plenty for a color average

export function useCoverColor(src: string, fallback: string) {
  const [color, setColor] = useState(() => cache.get(src) ?? fallback);

  useEffect(() => {
    const hit = cache.get(src);
    if (hit) {
      setColor(hit);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      if (cancelled) return;
      try {
        const picked = pickColor(img);
        cache.set(src, picked);
        setColor(picked);
      } catch {
        setColor(fallback);
      }
    };
    img.onerror = () => !cancelled && setColor(fallback);
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, fallback]);

  return color;
}

function pickColor(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, SIZE, SIZE);
  const data = ctx.getImageData(0, 0, SIZE, SIZE).data; // throws if the image isn't readable

  let r = 0;
  let g = 0;
  let b = 0;
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    const [, s, l] = toHsl(data[i], data[i + 1], data[i + 2]);
    // colorful, mid-bright pixels count most; greys and near-black/white count a little
    const weight = 0.08 + s * s * (1 - Math.abs(l - 0.5) * 2);
    r += data[i] * weight;
    g += data[i + 1] * weight;
    b += data[i + 2] * weight;
    total += weight;
  }

  const [h, s] = toHsl(r / total, g / total, b / total);
  // deep and moderately saturated, so light text stays readable on any cover
  return toRgb(h, Math.min(s * 1.2, 0.62), 0.24);
}

function toHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

function toRgb(h: number, s: number, l: number): string {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    t = (t + 1) % 1;
    const v = t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
    return Math.round(v * 255);
  };
  return `rgb(${channel(h + 1 / 3)}, ${channel(h)}, ${channel(h - 1 / 3)})`;
}
