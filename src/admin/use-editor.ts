"use client";

// Editor state: the working copy of the site content with undo/redo, photos
// picked but not yet published, and a draft kept in this browser so closing the
// tab loses nothing.

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAt, NEW_ITEMS, publishedContent, setAt, type Content, type ListKey } from "@/lib/content";

const DRAFT_KEY = "site-editor-draft";
const HISTORY_LIMIT = 100;

type History = { past: Content[]; present: Content; future: Content[] };

export function useEditor() {
  const [history, setHistory] = useState<History>({ past: [], present: publishedContent, future: [] });
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  // What's live (or about to be, after a publish); changes are measured against it
  const [baseline, setBaseline] = useState<Content>(publishedContent);
  const content = history.present;

  // Restore a draft from an earlier visit
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as { content: Content; uploads?: Record<string, string> };
      setHistory({ past: [], present: draft.content, future: [] });
      setUploads(draft.uploads ?? {});
      setRestoredDraft(true);
    } catch {
      /* unreadable draft: start from the published site */
    }
  }, []);

  const serialized = useMemo(() => JSON.stringify(content), [content]);
  const dirty = useMemo(() => serialized !== JSON.stringify(baseline), [serialized, baseline]);

  // Only photos still referenced by the content matter
  const usedUploads = useMemo(
    () => Object.fromEntries(Object.entries(uploads).filter(([path]) => serialized.includes(`"${path}"`))),
    [uploads, serialized],
  );

  // Keep the draft in this browser
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (dirty) localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, uploads: usedUploads }));
        else localStorage.removeItem(DRAFT_KEY);
        setDraftError(null);
      } catch {
        setDraftError("Your browser's storage is full, so the draft isn't saved. Publish soon to keep your changes.");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [content, usedUploads, dirty]);

  const update = useCallback((fn: (c: Content) => Content) => {
    setHistory((h) => {
      const next = fn(h.present);
      if (next === h.present) return h;
      return { past: [...h.past.slice(-HISTORY_LIMIT + 1), h.present], present: next, future: [] };
    });
  }, []);

  const set = useCallback((path: string, value: unknown) => update((c) => setAt(c, path, value)), [update]);

  const undo = useCallback(
    () =>
      setHistory((h) =>
        h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] } : h,
      ),
    [],
  );
  const redo = useCallback(
    () => setHistory((h) => (h.future.length ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) } : h)),
    [],
  );

  const addUpload = useCallback((path: string, dataUrl: string) => setUploads((u) => ({ ...u, [path]: dataUrl })), []);
  const resolve = useCallback((src: string) => uploads[src] ?? src, [uploads]);

  /* ---- list helpers; return the path of the affected item ---- */

  const addItem = (list: ListKey) => {
    const index = content[list].length;
    update((c) => ({ ...c, [list]: [...c[list], NEW_ITEMS[list]()] }));
    return `${list}.${index}`;
  };

  const moveItem = (path: string, dir: -1 | 1) => {
    const [list, i] = splitItem(path);
    const items = content[list] as unknown[];
    const j = i + dir;
    if (j < 0 || j >= items.length) return path;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    update((c) => ({ ...c, [list]: next }));
    return `${list}.${j}`;
  };

  const duplicateItem = (path: string) => {
    const [list, i] = splitItem(path);
    const copy = structuredClone(getAt(content, path)) as Record<string, unknown>;
    if (list === "projects") copy.slug = `${copy.slug}-copy-${Date.now().toString(36)}`;
    const next = [...(content[list] as unknown[])];
    next.splice(i + 1, 0, copy);
    update((c) => ({ ...c, [list]: next }));
    return `${list}.${i + 1}`;
  };

  const removeItem = (path: string) => {
    const [list, i] = splitItem(path);
    update((c) => ({ ...c, [list]: (c[list] as unknown[]).filter((_, k) => k !== i) }));
  };

  const discardDraft = () => {
    setHistory({ past: [], present: baseline, future: [] });
    setUploads({});
    setRestoredDraft(false);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  };

  /** After publishing, the published copy is the new baseline; keep uploads in memory until the rebuild serves them. */
  const markPublished = () => {
    setBaseline(content);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setRestoredDraft(false);
  };

  return {
    content,
    set,
    update,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    dirty,
    uploads: usedUploads,
    addUpload,
    resolve,
    addItem,
    moveItem,
    duplicateItem,
    removeItem,
    discardDraft,
    markPublished,
    restoredDraft,
    draftError,
  };
}

export type Editor = ReturnType<typeof useEditor>;

export function splitItem(path: string): [ListKey, number] {
  const [list, i] = path.split(".");
  return [list as ListKey, Number(i)];
}

export const isListItem = (path: string | null) => !!path && /^(projects|photos|favPics|tracks)\.\d+$/.test(path);
