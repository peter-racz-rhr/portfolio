// "Download changes": saves everything the editor holds (the site content plus
// any new pictures) as one JSON file, as a fallback when publishing to GitHub
// doesn't work. `node scripts/apply-export.mjs <file>` puts it into the repo.

import type { Content } from "@/lib/content";

export const EXPORT_FORMAT = "portfolio-editor-export";

export type EditorExport = {
  format: typeof EXPORT_FORMAT;
  version: 1;
  exportedAt: string;
  content: Content;
  /** "/uploads/<id>-<name>.jpg" → "data:image/jpeg;base64,…" */
  images: Record<string, string>;
};

export function downloadChanges(content: Content, images: Record<string, string>) {
  const data: EditorExport = {
    format: EXPORT_FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    content,
    images,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "");
  const a = document.createElement("a");
  a.href = url;
  a.download = `portfolio-changes-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return a.download;
}
