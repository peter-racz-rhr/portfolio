"use client";

import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useState } from "react";

// Shows the address as text with a copy button; mailto links don't work for everyone
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(email).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          },
          () => {},
        );
      }}
      className="group flex items-center gap-3 self-start text-left transition-transform duration-150 ease-out active:scale-[0.98]"
    >
      <span className="text-2xl font-semibold tracking-tight underline decoration-canvas/30 underline-offset-8 group-hover:decoration-lilac sm:text-4xl">
        {email}
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-fg">
        {copied ? <IconCheck className="size-4" /> : <IconCopy className="size-4" />}
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? "Email copied" : ""}
      </span>
    </button>
  );
}
