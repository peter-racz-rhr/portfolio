"use client";

// Right-hand panel: a form for whatever is selected (a project, photo, polaroid,
// song, or the site links), plus move / duplicate / delete for list items.

import { useRef, useState } from "react";
import {
  IconArrowDown,
  IconArrowUp,
  IconCopy,
  IconPhotoUp,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { prepareImage } from "@/admin/images";
import { isListItem, splitItem, type Editor } from "@/admin/use-editor";
import { getAt, PROJECT_ICONS, PROJECT_STATUSES } from "@/lib/content";

const LIST_NAMES = { projects: "Project", photos: "Photo", favPics: "Polaroid", tracks: "Song" } as const;

const LABELS: Record<string, string> = {
  name: "Name",
  slug: "Link name (no spaces)",
  blurb: "Short line",
  description: "Description",
  stack: "Tech (comma separated)",
  status: "Status",
  year: "Year",
  color: "Card color",
  icon: "Icon",
  repo: "GitHub link",
  live: "Live link",
  image: "Picture",
  caption: "Caption",
  title: "Title",
  x: "Left ↔ right",
  y: "Top ↕ bottom",
  rotate: "Tilt",
  artist: "Artist",
  album: "Album",
  length: "Length",
  cover: "Album cover",
  handle: "Handle",
  tagline: "Tagline",
  heroImage: "Hero background picture",
  email: "Email",
  github: "GitHub link",
  instagram: "Instagram link",
  kofi: "Ko-fi link",
  spotify: "Spotify profile link",
};

const LONG = new Set(["description", "blurb", "tagline"]);
const IMAGE = new Set(["image", "cover", "heroImage"]);
const RANGES: Record<string, [number, number, number, string]> = {
  x: [0, 85, 1, "%"],
  y: [0, 26, 0.5, "rem"],
  rotate: [-20, 20, 1, "°"],
};

export function Inspector({
  editor,
  path,
  onSelect,
}: {
  editor: Editor;
  path: string | null;
  onSelect: (path: string | null) => void;
}) {
  if (!path) {
    return (
      <div className="flex h-full flex-col gap-3 p-5 text-sm text-fg/60">
        <p className="font-semibold text-fg">Nothing selected</p>
        <p>Click any text on the page to type over it.</p>
        <p>Click a project card, photo, polaroid or song to edit its details here.</p>
        <p>Use the list on the left to add new ones.</p>
      </div>
    );
  }

  const value = getAt(editor.content, path) as Record<string, unknown> | undefined;
  if (!value || typeof value !== "object") return null;

  const listItem = isListItem(path);
  const [list, index] = listItem ? splitItem(path) : [null, 0];
  const count = list ? (editor.content[list] as unknown[]).length : 0;
  const heading = list ? `${LIST_NAMES[list]} ${index + 1} of ${count}` : "Site settings & links";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-fg/10 px-5 py-4">
        <p className="font-semibold">{heading}</p>
        <button type="button" onClick={() => onSelect(null)} aria-label="Close panel" className="rounded-lg p-1.5 hover:bg-fg/5">
          <IconX className="size-4" />
        </button>
      </div>

      {listItem && (
        <div className="flex gap-1.5 border-b border-fg/10 px-5 py-3">
          <ToolButton label="Move up" disabled={index === 0} onClick={() => onSelect(editor.moveItem(path, -1))}>
            <IconArrowUp className="size-4" />
          </ToolButton>
          <ToolButton label="Move down" disabled={index === count - 1} onClick={() => onSelect(editor.moveItem(path, 1))}>
            <IconArrowDown className="size-4" />
          </ToolButton>
          <ToolButton label="Duplicate" onClick={() => onSelect(editor.duplicateItem(path))}>
            <IconCopy className="size-4" />
          </ToolButton>
          <DeleteButton
            onConfirm={() => {
              editor.removeItem(path);
              onSelect(null);
            }}
          />
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {Object.entries(value).map(([key, v]) => (
          <Field key={`${path}.${key}`} editor={editor} path={`${path}.${key}`} name={key} value={v} />
        ))}
        {list === "projects" && !("live" in value) && (
          <button
            type="button"
            className="text-sm font-semibold text-plum underline underline-offset-4"
            onClick={() => editor.set(`${path}.live`, "https://")}
          >
            + Add a live link
          </button>
        )}
      </div>
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-lg border border-fg/10 bg-white transition-colors duration-150 hover:bg-fg/5 active:scale-95 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  return armed ? (
    <div className="ml-auto flex items-center gap-1.5">
      <button type="button" onClick={() => setArmed(false)} className="rounded-lg px-2.5 py-2 text-xs hover:bg-fg/5">
        Keep
      </button>
      <button type="button" onClick={onConfirm} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white">
        Delete
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setArmed(true)}
      title="Delete"
      aria-label="Delete"
      className="ml-auto flex size-9 items-center justify-center rounded-lg border border-fg/10 bg-white text-red-600 hover:bg-red-50"
    >
      <IconTrash className="size-4" />
    </button>
  );
}

const inputCls =
  "w-full rounded-lg border border-fg/15 bg-white px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus:border-plum";

function Field({ editor, path, name, value }: { editor: Editor; path: string; name: string; value: unknown }) {
  const label = LABELS[name] ?? name;
  const id = `field-${path.replace(/\./g, "-")}`;
  const wrap = (control: React.ReactNode) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold tracking-wide text-fg/60 uppercase">
        {label}
      </label>
      {control}
    </div>
  );

  if (IMAGE.has(name)) return wrap(<ImageField id={id} editor={editor} path={path} value={String(value)} />);

  if (name in RANGES) {
    const [min, max, step, unit] = RANGES[name];
    return wrap(
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={Number(value)}
          onChange={(e) => editor.set(path, Number(e.target.value))}
          className="flex-1 accent-[var(--color-plum)]"
        />
        <span className="w-14 text-right font-mono text-xs tabular-nums">
          {Number(value)}
          {unit}
        </span>
      </div>,
    );
  }

  if (name === "color")
    return wrap(
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={String(value)}
          onChange={(e) => editor.set(path, e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-fg/15 bg-white p-1"
        />
        <BufferedInput value={String(value)} onCommit={(v) => /^#[0-9a-f]{6}$/i.test(v) && editor.set(path, v)} className={inputCls} />
      </div>,
    );

  if (name === "icon" || name === "status") {
    const options = name === "icon" ? PROJECT_ICONS : PROJECT_STATUSES;
    return wrap(
      <select id={id} value={String(value)} onChange={(e) => editor.set(path, e.target.value)} className={inputCls}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>,
    );
  }

  if (Array.isArray(value))
    return wrap(
      <BufferedInput
        id={id}
        value={value.join(", ")}
        onCommit={(v) =>
          editor.set(
            path,
            v
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        className={inputCls}
      />,
    );

  if (typeof value === "number")
    return wrap(
      <BufferedInput id={id} type="number" value={String(value)} onCommit={(v) => editor.set(path, Number(v) || 0)} className={inputCls} />,
    );

  return wrap(
    <BufferedInput
      id={id}
      value={String(value ?? "")}
      multiline={LONG.has(name)}
      onCommit={(v) => editor.set(path, v)}
      className={inputCls}
    />,
  );
}

/** Text input that commits on blur / Enter, so typing doesn't flood the undo history. */
function BufferedInput({
  value,
  onCommit,
  multiline,
  ...rest
}: {
  value: string;
  onCommit: (v: string) => void;
  multiline?: boolean;
  id?: string;
  type?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const shown = focused ? draft : value;
  const common = {
    ...rest,
    value: shown,
    onFocus: () => {
      setDraft(value);
      setFocused(true);
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
    onBlur: () => {
      setFocused(false);
      if (draft !== value) onCommit(draft);
    },
  };
  return multiline ? (
    <textarea {...common} rows={4} className={`${rest.className} resize-y`} />
  ) : (
    <input
      {...common}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
    />
  );
}

function ImageField({ id, editor, path, value }: { id: string; editor: Editor; path: string; value: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-fg/10 bg-fg/5"
      >
        <img src={editor.resolve(value)} alt="" className="size-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center gap-2 bg-fg/50 text-sm font-semibold text-canvas opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <IconPhotoUp className="size-5" /> {busy ? "Preparing…" : "Replace picture"}
        </span>
      </button>
      <input
        ref={fileRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          setError(null);
          try {
            const { path: imagePath, dataUrl } = await prepareImage(file);
            editor.addUpload(imagePath, dataUrl);
            editor.set(path, imagePath);
          } catch {
            setError("That file couldn't be read as a picture. Try a JPG or PNG.");
          } finally {
            setBusy(false);
          }
        }}
      />
      <BufferedInput value={value} onCommit={(v) => editor.set(path, v.trim())} className={`${inputCls} font-mono text-xs`} />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
