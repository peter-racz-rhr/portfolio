"use client";

// "On repeat": an album sleeve with a vinyl sliding out and spinning, next to
// a track list. Hover (or tap) a track and the record swaps to it. Shows live
// Spotify data from /api/spotify (a Netlify function); falls back to the
// hand-picked `tracks` in the site content when that isn't available (local dev,
// or inside the admin editor, where the hand-picked list is what you edit).

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { IconArrowUpRight, IconBrandSpotify } from "@tabler/icons-react";
import { T, useContent } from "@/components/content-provider";
import { cn } from "@/lib/utils";

const EASE = [0.23, 1, 0.32, 1] as const;
const PALETTE = ["#48284a", "#7c4a79", "#1b1419", "#5b3a5d", "#8a5a85", "#2e1d2f"];

type Track = {
  title: string;
  artist: string;
  album: string;
  length: string;
  cover: string;
  color: string;
  url?: string;
  live?: boolean;
};

type LiveTrack = Omit<Track, "color" | "cover"> & { cover: string | null; isPlaying?: boolean };
type SpotifyResponse = { tracks: LiveTrack[]; nowPlaying: LiveTrack | null };

function fromSpotify(data: SpotifyResponse, fallbackCover: string): Track[] {
  const list: LiveTrack[] = [...data.tracks];
  const now = data.nowPlaying?.isPlaying ? data.nowPlaying : null;
  if (now) {
    const i = list.findIndex((t) => t.url === now.url);
    if (i >= 0) list.splice(i, 1);
    list.unshift({ ...now, live: true });
  }
  return list.slice(0, 6).map((t, i) => ({
    ...t,
    cover: t.cover ?? fallbackCover,
    color: PALETTE[i % PALETTE.length],
  }));
}

export function OnRepeat() {
  const { content, editing, resolve } = useContent();
  const [liveList, setLiveList] = useState<Track[] | null>(null);
  const [active, setActive] = useState(0);
  const fallbackCover = content.tracks[0]?.cover ?? content.site.heroImage;

  useEffect(() => {
    if (editing) return;
    let cancelled = false;
    fetch("/api/spotify")
      .then((r) => (r.ok ? (r.json() as Promise<SpotifyResponse>) : Promise.reject()))
      .then((data) => {
        if (cancelled || !data.tracks?.length) return;
        setLiveList(fromSpotify(data, fallbackCover));
        setActive(0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [editing, fallbackCover]);

  const list: Track[] = !editing && liveList ? liveList : content.tracks;
  if (!list.length) return null;
  const t = list[active] ?? list[0];
  const listeningNow = list[0]?.live;
  const liveLabel = listeningNow ? "Listening right now" : liveList && !editing ? "My top tracks this month" : null;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <motion.div
        animate={{ backgroundColor: t.color }}
        transition={{ duration: 0.6, ease: EASE }}
        className="grid gap-10 overflow-hidden rounded-[2.5rem] p-6 text-canvas sm:p-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14"
      >
        {/* Sleeve + record */}
        <div className="relative flex items-center py-4">
          <div className="relative aspect-square w-[58%] max-w-[300px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                className="absolute inset-[3%] z-0"
                initial={{ x: "0%", opacity: 0.6 }}
                animate={{ x: "52%", opacity: 1, transition: { duration: 0.7, ease: EASE, delay: 0.15 } }}
                exit={{ x: "0%", opacity: 0, transition: { duration: 0.3, ease: EASE } }}
              >
                <div className="vinyl size-full rounded-full shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]">
                  <img
                    src={resolve(t.cover)}
                    alt=""
                    className="absolute inset-[31%] size-[38%] rounded-full object-cover"
                    draggable={false}
                  />
                  <span className="absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-canvas" />
                </div>
              </motion.div>
            </AnimatePresence>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.img
                key={active}
                src={resolve(t.cover)}
                alt={`${t.album} cover`}
                initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.4, ease: EASE }}
                className="relative z-10 size-full rounded-lg object-cover shadow-[0_25px_50px_-20px_rgba(0,0,0,0.7)] ring-1 ring-canvas/15"
                draggable={false}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Track list */}
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center justify-between gap-4">
            <p className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase opacity-80">
              {listeningNow && (
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-canvas opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-canvas" />
                </span>
              )}
              {liveLabel ?? <T path="music.eyebrow" />}
            </p>
            <a
              href={content.site.spotify}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-canvas/10 px-3 py-1.5 text-xs transition-colors duration-150 hover:bg-canvas/20"
            >
              <IconBrandSpotify className="size-4" /> Spotify <IconArrowUpRight className="size-3.5" />
            </a>
          </div>
          <T path="music.title" as="h2" className="mt-3 block font-display text-4xl leading-none uppercase sm:text-6xl" />

          <ol className="mt-8 flex flex-col">
            {list.map((tr, i) => {
              const on = i === active;
              return (
                <li key={`${i}-${tr.title}`} className="relative" data-edit={liveList && !editing ? undefined : `tracks.${i}`}>
                  <button
                    type="button"
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-pressed={on}
                    className={cn(
                      "grid w-full grid-cols-[1.75rem_1fr_auto] items-center gap-4 rounded-xl px-3 py-3 text-left transition-colors duration-150",
                      on ? "bg-canvas/15" : "hover:bg-canvas/5",
                    )}
                  >
                    <span className="flex h-4 items-end justify-center gap-[3px]">
                      {on ? (
                        <>
                          <span className="eq-bar" />
                          <span className="eq-bar [animation-delay:-0.4s]" />
                          <span className="eq-bar [animation-delay:-0.2s]" />
                        </>
                      ) : (
                        <span className="font-mono text-xs opacity-50">{String(i + 1).padStart(2, "0")}</span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold tracking-tight">{tr.title}</span>
                      <span className="block truncate text-sm opacity-60">
                        {tr.artist} · {tr.album}
                      </span>
                    </span>
                    <span className="font-mono text-xs tabular-nums opacity-60">{tr.live ? "live" : tr.length}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-auto pt-8">
            <div className="flex justify-between font-mono text-[11px] tracking-wider uppercase opacity-60">
              <span className="truncate">
                {t.live ? "Playing now" : "Now spinning"} · {t.title}
              </span>
              <span className="tabular-nums">{t.length}</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-canvas/15">
              <div key={active} className="progress h-full origin-left rounded-full bg-canvas" />
            </div>
            {t.url && (
              <a
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-canvas/30 underline-offset-4 hover:decoration-canvas"
              >
                Play on Spotify <IconArrowUpRight className="size-4" />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
