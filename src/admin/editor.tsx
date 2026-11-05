"use client";

// The site editor: your real pages in the middle (click text to type, click a
// card/photo/song to edit it on the right), pages and lists on the left,
// undo/redo and Publish on top.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconArrowDown,
  IconArrowUp,
  IconChevronRight,
  IconExternalLink,
  IconEye,
  IconEyeOff,
  IconLogout,
  IconPlus,
  IconSettings,
} from "@tabler/icons-react";
import { LOCAL_DEV, logout, publish, uploadImage } from "@/admin/api";
import { Inspector } from "@/admin/inspector";
import { useEditor, type Editor as EditorState } from "@/admin/use-editor";
import { ContentProvider } from "@/components/content-provider";
import { HOME_SECTION_NAMES, type ListKey } from "@/lib/content";
import { cn } from "@/lib/utils";
import { AboutView, GalleryView, HomeView, ProjectsView } from "@/views/site-views";

const PAGES = [
  { id: "home", name: "Home", href: "/", View: HomeView },
  { id: "projects", name: "Projects", href: "/projects", View: ProjectsView },
  { id: "gallery", name: "Gallery", href: "/gallery", View: GalleryView },
  { id: "about", name: "About", href: "/about", View: AboutView },
] as const;
type PageId = (typeof PAGES)[number]["id"];

const LISTS: { key: ListKey; name: string; label: (item: Record<string, unknown>) => string; shownOn: PageId }[] = [
  { key: "projects", name: "Projects", label: (p) => String(p.name), shownOn: "projects" },
  { key: "photos", name: "Photos", label: (p) => String(p.name), shownOn: "gallery" },
  { key: "favPics", name: "Polaroids (About)", label: (p) => String(p.title), shownOn: "about" },
  { key: "tracks", name: "Songs (On repeat)", label: (p) => `${p.title} · ${p.artist}`, shownOn: "home" },
];

type PublishState =
  | { kind: "idle" }
  | { kind: "working"; step: string }
  | { kind: "done"; url: string }
  | { kind: "error"; message: string };

export function Editor({ onLoggedOut }: { onLoggedOut: () => void }) {
  const editor = useEditor();
  const [page, setPage] = useState<PageId>("home");
  const [selected, setSelected] = useState<string | null>(null);
  const [publishState, setPublishState] = useState<PublishState>({ kind: "idle" });
  const canvasRef = useRef<HTMLDivElement>(null);

  const providerValue = useMemo(
    () => ({ content: editor.content, editing: true, set: editor.set, resolve: editor.resolve }),
    [editor.content, editor.set, editor.resolve],
  );

  // Undo / redo shortcuts, except while typing in a field
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.isContentEditable || t.closest("input, textarea, select")) return;
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      if (e.shiftKey) editor.redo();
      else editor.undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editor]);

  // Warn before leaving with unpublished changes that couldn't be saved as a draft
  useEffect(() => {
    if (!editor.draftError) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [editor.draftError]);

  // Clicks on the page select things instead of following links or opening cards
  const onCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-edit-text]")) return;
    const editable = target.closest<HTMLElement>("[data-edit]");
    if (editable || target.closest("a")) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (editable) setSelected(editable.dataset.edit!);
  };

  const showPage = (id: PageId) => {
    setPage(id);
    canvasRef.current?.scrollTo({ top: 0 });
  };

  const selectItem = (path: string, shownOn?: PageId) => {
    setSelected(path);
    if (shownOn && shownOn !== page && !(shownOn === "home" && page === "home")) showPage(shownOn);
    requestAnimationFrame(() =>
      canvasRef.current?.querySelector(`[data-edit="${path}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" }),
    );
  };

  const onPublish = async () => {
    if (LOCAL_DEV) {
      setPublishState({ kind: "error", message: "Publishing only works on the live site (Netlify), not in local development." });
      return;
    }
    try {
      const entries = Object.entries(editor.uploads);
      const images: { path: string; sha: string }[] = [];
      for (const [i, [path, dataUrl]] of entries.entries()) {
        setPublishState({ kind: "working", step: `Uploading picture ${i + 1} of ${entries.length}…` });
        images.push({ path, ...(await uploadImage(path, dataUrl)) });
      }
      setPublishState({ kind: "working", step: "Saving to GitHub…" });
      const res = await publish(editor.content, images);
      editor.markPublished();
      setPublishState({ kind: "done", url: res.url });
    } catch (err) {
      setPublishState({ kind: "error", message: err instanceof Error ? err.message : "Publishing failed." });
    }
  };

  const current = PAGES.find((p) => p.id === page)!;

  return (
    <div className="flex h-dvh flex-col bg-[#ece8e3] text-fg">
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-fg/10 bg-white px-4 py-2.5">
        <span className="font-display text-sm uppercase">Editor</span>
        <span className="hidden text-sm text-fg/50 md:inline">/ {current.name}</span>
        <label htmlFor="page-picker" className="sr-only">
          Page
        </label>
        <select
          id="page-picker"
          value={page}
          onChange={(e) => showPage(e.target.value as PageId)}
          className="rounded-lg border border-fg/15 bg-white px-2 py-1.5 text-sm md:hidden"
        >
          {PAGES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="ml-2 flex gap-1">
          <IconButton label="Undo (Ctrl+Z)" disabled={!editor.canUndo} onClick={editor.undo}>
            <IconArrowBackUp className="size-4" />
          </IconButton>
          <IconButton label="Redo (Ctrl+Shift+Z)" disabled={!editor.canRedo} onClick={editor.redo}>
            <IconArrowForwardUp className="size-4" />
          </IconButton>
        </div>

        <p className="ml-auto hidden text-xs text-fg/50 md:block" aria-live="polite">
          {editor.dirty ? "Unpublished changes · draft saved in this browser" : "Everything is published"}
        </p>
        <a
          href={current.href}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm hover:bg-fg/5"
        >
          View live <IconExternalLink className="size-4" />
        </a>
        <button
          type="button"
          disabled={!editor.dirty || publishState.kind === "working"}
          onClick={onPublish}
          className="rounded-lg bg-plum px-4 py-2 text-sm font-semibold text-canvas transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-40"
        >
          {publishState.kind === "working" ? "Publishing…" : "Publish"}
        </button>
        {!LOCAL_DEV && (
          <IconButton
            label="Log out"
            onClick={async () => {
              await logout().catch(() => {});
              onLoggedOut();
            }}
          >
            <IconLogout className="size-4" />
          </IconButton>
        )}
      </header>

      <Banner editor={editor} publishState={publishState} onDismiss={() => setPublishState({ kind: "idle" })} />

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-fg/10 bg-white md:flex">
          <SidebarGroup title="Pages">
            {PAGES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => showPage(p.id)}
                className={cn("w-full rounded-lg px-3 py-2 text-left text-sm", page === p.id ? "bg-fg text-canvas" : "hover:bg-fg/5")}
              >
                {p.name}
              </button>
            ))}
          </SidebarGroup>

          {page === "home" && <HomeSections editor={editor} />}

          <SidebarGroup title="Content">
            <button
              type="button"
              onClick={() => setSelected("site")}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm",
                selected === "site" ? "bg-lilac/50" : "hover:bg-fg/5",
              )}
            >
              <IconSettings className="size-4" /> Site settings & links
            </button>
            {LISTS.map((l) => (
              <ListGroup
                key={l.key}
                list={l}
                editor={editor}
                selected={selected}
                onSelect={(path) => selectItem(path, l.shownOn)}
              />
            ))}
          </SidebarGroup>
        </aside>

        {/* Canvas */}
        <main
          ref={canvasRef}
          onClickCapture={onCanvasClick}
          className="edit-canvas min-w-0 flex-1 overflow-y-auto"
          aria-label={`${current.name} page preview`}
        >
          <style>{selected ? `.edit-canvas [data-edit="${selected}"]{outline:3px solid var(--color-plum);outline-offset:4px;border-radius:1.25rem}` : ""}</style>
          <div className="min-h-full bg-canvas pb-24">
            <ContentProvider value={providerValue}>
              <current.View key={page} />
            </ContentProvider>
          </div>
        </main>

        {/* Inspector */}
        <aside className="hidden w-80 shrink-0 border-l border-fg/10 bg-white lg:block">
          <Inspector editor={editor} path={selected} onSelect={setSelected} />
        </aside>
      </div>

      {/* Inspector as a bottom sheet on smaller screens */}
      {selected && (
        <div className="fixed inset-x-0 bottom-0 z-40 max-h-[70dvh] overflow-hidden rounded-t-2xl border-t border-fg/10 bg-white shadow-2xl lg:hidden">
          <Inspector editor={editor} path={selected} onSelect={setSelected} />
        </div>
      )}
    </div>
  );
}

function Banner({
  editor,
  publishState,
  onDismiss,
}: {
  editor: EditorState;
  publishState: PublishState;
  onDismiss: () => void;
}) {
  const base = "flex items-center gap-3 px-4 py-2 text-sm";
  if (publishState.kind === "working") return <div className={cn(base, "bg-lilac/60")}>{publishState.step}</div>;
  if (publishState.kind === "done")
    return (
      <div className={cn(base, "bg-emerald-100 text-emerald-950")}>
        Published. The live site updates in about 1–2 minutes.
        <a href={publishState.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
          See the change on GitHub
        </a>
        <button type="button" onClick={onDismiss} className="ml-auto text-xs underline">
          OK
        </button>
      </div>
    );
  if (publishState.kind === "error")
    return (
      <div className={cn(base, "bg-red-100 text-red-950")}>
        {publishState.message}
        <button type="button" onClick={onDismiss} className="ml-auto text-xs underline">
          Dismiss
        </button>
      </div>
    );
  if (editor.draftError) return <div className={cn(base, "bg-amber-100 text-amber-950")}>{editor.draftError}</div>;
  if (editor.restoredDraft && editor.dirty)
    return (
      <div className={cn(base, "bg-amber-50")}>
        Picked up where you left off: your unpublished changes are back.
        <button type="button" onClick={editor.discardDraft} className="ml-auto text-xs underline">
          Throw them away
        </button>
      </div>
    );
  return null;
}

function SidebarGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 border-b border-fg/10 p-3">
      <p className="px-3 pb-1 text-[11px] font-semibold tracking-widest text-fg/40 uppercase">{title}</p>
      {children}
    </div>
  );
}

function HomeSections({ editor }: { editor: EditorState }) {
  const { sections, projectsCount } = editor.content.home;
  const move = (i: number, dir: -1 | 1) => {
    const next = [...sections];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    editor.set("home.sections", next);
  };
  return (
    <SidebarGroup title="Home sections">
      {sections.map((s, i) => (
        <div key={s.id} className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm hover:bg-fg/5">
          <span className={cn("flex-1 truncate px-1", !s.visible && "text-fg/35 line-through")}>{HOME_SECTION_NAMES[s.id]}</span>
          <IconButton small label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
            <IconArrowUp className="size-3.5" />
          </IconButton>
          <IconButton small label="Move down" disabled={i === sections.length - 1} onClick={() => move(i, 1)}>
            <IconArrowDown className="size-3.5" />
          </IconButton>
          <IconButton
            small
            label={s.visible ? "Hide section" : "Show section"}
            onClick={() => editor.set(`home.sections.${i}.visible`, !s.visible)}
          >
            {s.visible ? <IconEye className="size-3.5" /> : <IconEyeOff className="size-3.5" />}
          </IconButton>
        </div>
      ))}
      <label className="flex items-center justify-between gap-2 px-3 pt-2 text-sm">
        Projects shown on Home
        <input
          type="number"
          min={1}
          max={editor.content.projects.length}
          value={projectsCount}
          onChange={(e) => editor.set("home.projectsCount", Math.max(1, Number(e.target.value) || 1))}
          className="w-14 rounded-md border border-fg/15 px-2 py-1 text-right"
        />
      </label>
    </SidebarGroup>
  );
}

function ListGroup({
  list,
  editor,
  selected,
  onSelect,
}: {
  list: (typeof LISTS)[number];
  editor: EditorState;
  selected: string | null;
  onSelect: (path: string) => void;
}) {
  const items = editor.content[list.key] as unknown as Record<string, unknown>[];
  const [open, setOpen] = useState(!!selected?.startsWith(`${list.key}.`));
  return (
    <div>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex flex-1 items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-fg/5"
        >
          <IconChevronRight className={cn("size-3.5 transition-transform duration-150", open && "rotate-90")} />
          {list.name}
          <span className="text-xs text-fg/40">{items.length}</span>
        </button>
        <IconButton
          small
          label={`Add to ${list.name}`}
          onClick={() => {
            setOpen(true);
            onSelect(editor.addItem(list.key));
          }}
        >
          <IconPlus className="size-3.5" />
        </IconButton>
      </div>
      {open && (
        <ul className="ml-5 border-l border-fg/10 pl-2">
          {items.map((item, i) => {
            const path = `${list.key}.${i}`;
            return (
              <li key={path}>
                <button
                  type="button"
                  onClick={() => onSelect(path)}
                  className={cn(
                    "w-full truncate rounded-md px-2 py-1.5 text-left text-xs",
                    selected === path ? "bg-lilac/60 font-semibold" : "text-fg/70 hover:bg-fg/5",
                  )}
                >
                  {list.label(item)}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  small,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-lg transition-colors duration-150 hover:bg-fg/10 disabled:opacity-25",
        small ? "size-7" : "size-9",
      )}
    >
      {children}
    </button>
  );
}
