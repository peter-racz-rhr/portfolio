"use client";

// "On repeat": an album sleeve with a vinyl sliding out and spinning, next to
// a track list. Hover (or tap) a track and the record swaps to it. Shows live
// Spotify data from /api/spotify (a Netlify function); falls back to the
// hand-picked `tracks` in the site content when that isn't available (local dev,
// or inside the admin editor, where the hand-picked list is what you edit).
// The card takes its color from the album cover. While a song is playing the
// bar shows how far into it you are, and the list refreshes when it ends.

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { IconArrowUpRight, IconBrandSpotify } from "@tabler/icons-react";
import { T, useContent } from "@/components/content-provider";
import { useCoverColor } from "@/lib/cover-color";
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
  durationMs?: number;
  /** wall-clock time (ms) the playing song started, for the live progress bar */
  startedAt?: number;
};

type LiveTrack = Omit<Track, "color" | "cover"> & { cover: string | null; isPlaying?: boolean; progressMs?: number };
type SpotifyResponse = { tracks: LiveTrack[]; nowPlaying: LiveTrack | null; updatedAt?: string };

const REFRESH_MS = 30_000;

function fromSpotify(data: SpotifyResponse, fallbackCover: string): Track[] {
  const list: LiveTrack[] = [...data.tracks];
  const now = data.nowPlaying?.isPlaying ? data.nowPlaying : null;
  if (now) {
    const i = list.findIndex((t) => t.url === now.url);
    if (i >= 0) list.splice(i, 1);
    // the answer may be a few seconds old (cached), so work from when Spotify was asked
    const askedAt = data.updatedAt ? Date.parse(data.updatedAt) : Date.now();
    list.unshift({ ...now, live: true, startedAt: askedAt - (now.progressMs ?? 0) } as LiveTrack);
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
  // Public site waits (briefly) for Spotify before showing anything, so the
  // hand-picked songs don't flash up and get swapped out.
  const [loading, setLoading] = useState(!editing);
  const [active, setActive] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const fallbackCover = content.tracks[0]?.cover ?? content.site.heroImage;
  const askAgain = useCallback(() => setRefresh((r) => r + 1), []);

  // check Spotify again every so often (skips, pauses, new songs)
  useEffect(() => {
    if (editing) return;
    const id = setInterval(() => !document.hidden && askAgain(), REFRESH_MS);
    return () => clearInterval(id);
  }, [editing, askAgain]);

  useEffect(() => {
    if (editing) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    let disposed = false;
    fetch("/api/spotify", { signal: controller.signal })
      .then((r) => (r.ok ? (r.json() as Promise<SpotifyResponse>) : Promise.reject()))
      .then((data) => {
        if (!data.tracks?.length) return;
        setLiveList(fromSpotify(data, fallbackCover));
        // first load, or the playing song was showing: show what's playing now
        setActive((a) => (refresh === 0 || a === 0 ? 0 : a));
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timeout);
        // live songs, or the hand-picked ones if Spotify was slow or failed
        if (!disposed) setLoading(false);
      });
    return () => {
      disposed = true;
      clearTimeout(timeout);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `refresh` only re-triggers the request
  }, [editing, fallbackCover, refresh]);

  const current = (!editing && liveList ? liveList : content.tracks)[active] ?? content.tracks[0];
  const background = useCoverColor(resolve(current?.cover ?? fallbackCover), current?.color ?? "#48284a");

  if (loading && !editing) return <OnRepeatSkeleton />;

  const list: Track[] = !editing && liveList ? liveList : content.tracks;
  if (!list.length) return null;
  const t = list[active] ?? list[0];
  const listeningNow = list[0]?.live;
  const liveLabel = listeningNow ? "Listening right now" : liveList && !editing ? "My top tracks this month" : null;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <motion.div
        animate={{ backgroundColor: background }}
        transition={{ duration: 0.8, ease: EASE }}
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
                    className="skeleton-dark absolute inset-[31%] size-[38%] rounded-full object-cover"
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
                className="skeleton-dark relative z-10 size-full rounded-lg object-cover shadow-[0_25px_50px_-20px_rgba(0,0,0,0.7)] ring-1 ring-canvas/15"
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
            {t.live && t.startedAt && t.durationMs ? (
              <LiveProgress key={t.url} track={t} onEnded={askAgain} />
            ) : (
              <>
                <div className="flex justify-between font-mono text-[11px] tracking-wider uppercase opacity-60">
                  <span className="truncate">Now spinning · {t.title}</span>
                  <span className="tabular-nums">{t.length}</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-canvas/15">
                  <div key={active} className="progress h-full origin-left rounded-full bg-canvas" />
                </div>
              </>
            )}
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

const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

/* Real position in the playing song; asks Spotify again shortly after it ends */
function LiveProgress({ track, onEnded }: { track: Track; onEnded: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  const duration = track.durationMs!;
  const elapsed = Math.min(Math.max(now - track.startedAt!, 0), duration);
  const ended = elapsed >= duration;

  useEffect(() => {
    if (!ended) return;
    const t = setTimeout(onEnded, 2000);
    return () => clearTimeout(t);
  }, [ended, onEnded]);

  return (
    <>
      <div className="flex justify-between font-mono text-[11px] tracking-wider uppercase opacity-60">
        <span className="truncate">Playing now · {track.title}</span>
        <span className="tabular-nums">
          {clock(elapsed)} / {track.length}
        </span>
      </div>
      <div
        className="mt-2 h-1 overflow-hidden rounded-full bg-canvas/15"
        role="progressbar"
        aria-label="Song progress"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration / 1000)}
        aria-valuenow={Math.round(elapsed / 1000)}
      >
        <div
          className="h-full origin-left rounded-full bg-canvas transition-transform duration-500 ease-linear"
          style={{ transform: `scaleX(${elapsed / duration})` }}
        />
      </div>
    </>
  );
}

/* Same shape as the real card, so nothing jumps when the songs arrive */
function OnRepeatSkeleton() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 sm:px-8" aria-busy="true" aria-label="Loading music">
      <div className="grid gap-10 overflow-hidden rounded-[2.5rem] bg-plum p-6 text-canvas sm:p-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div className="relative flex items-center py-4">
          <div className="relative aspect-square w-[58%] max-w-[300px]">
            <div className="skeleton-dark absolute inset-[3%] translate-x-[52%] rounded-full" />
            <div className="skeleton-dark relative z-10 size-full rounded-lg bg-plum" />
          </div>
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="skeleton-dark h-3 w-36 rounded-full" />
          <div className="skeleton-dark mt-4 h-10 w-3/4 rounded-xl sm:h-14" />
          <div className="mt-8 flex flex-col gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="grid grid-cols-[1.75rem_1fr_auto] items-center gap-4 px-3 py-3">
                <div className="skeleton-dark size-4 rounded" />
                <div className="space-y-2">
                  <div className="skeleton-dark h-3.5 rounded-full" style={{ width: `${70 - i * 8}%` }} />
                  <div className="skeleton-dark h-3 w-1/3 rounded-full" />
                </div>
                <div className="skeleton-dark h-3 w-8 rounded-full" />
              </div>
            ))}
          </div>
          <div className="mt-auto pt-8">
            <div className="skeleton-dark h-1 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
