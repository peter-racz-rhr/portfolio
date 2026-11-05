"use client";

// Gives every component the site content. On the public site it's the published
// JSON and read-only; inside /admin the editor swaps in a live, editable copy.

import { createContext, useContext } from "react";
import { getAt, publishedContent, type Content } from "@/lib/content";
import { cn } from "@/lib/utils";

type ContentContextValue = {
  content: Content;
  editing: boolean;
  /** Update one value by path, e.g. set("hero.line1", "Pete") */
  set: (path: string, value: unknown) => void;
  /** Map an image path to something the browser can show (unpublished uploads live in memory) */
  resolve: (src: string) => string;
};

const PUBLIC: ContentContextValue = {
  content: publishedContent,
  editing: false,
  set: () => {},
  resolve: (src) => src,
};

const ContentContext = createContext<ContentContextValue>(PUBLIC);

export function ContentProvider({ value, children }: { value?: ContentContextValue; children: React.ReactNode }) {
  return <ContentContext.Provider value={value ?? PUBLIC}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);

/**
 * Text that becomes editable in place inside the admin editor.
 * Enter finishes a single-line field; multiline fields keep line breaks.
 */
export function T({
  path,
  as: Tag = "span",
  className,
  multiline = false,
}: {
  path: string;
  as?: React.ElementType;
  className?: string;
  multiline?: boolean;
}) {
  const { content, editing, set } = useContent();
  const value = String(getAt(content, path) ?? "");
  if (!editing) return <Tag className={className}>{value}</Tag>;
  return (
    <Tag
      key={value}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck
      data-edit-text={path}
      className={cn(className, "edit-text")}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") {
          e.currentTarget.textContent = value;
          e.currentTarget.blur();
        }
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const next = (e.currentTarget.textContent ?? "").replace(/ /g, " ");
        if (next !== value) set(path, next.trim() || value);
      }}
    >
      {value}
    </Tag>
  );
}
