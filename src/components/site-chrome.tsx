"use client";

// Intro, dock, cursor and footer wrap every public page, but not the /admin editor.

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { CustomCursor } from "@/components/custom-cursor";
import { IntroPreloader } from "@/components/intro-preloader";
import { SiteDock } from "@/components/site-dock";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // A reload should start at the top with the intro, not wherever the browser
  // remembers you were scrolled (page-to-page navigation already starts at the top)
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!location.hash) window.scrollTo(0, 0);
  }, []);

  if (pathname.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <IntroPreloader />
      {children}
      <footer className="flex flex-wrap items-baseline gap-x-6 gap-y-2 px-5 pt-10 pb-32 font-mono text-[11px] tracking-wider text-fg/40 uppercase sm:px-8">
        <span>© 2026 Peter Racz · interactions inspired by Skiper UI &amp; Aceternity UI</span>
        <span className="flex gap-4">
          <a href="/privacy/" className="underline-offset-4 hover:text-plum hover:underline">
            Privacy · Adatvédelem
          </a>
          <a href="/legal/" className="underline-offset-4 hover:text-plum hover:underline">
            Legal · Impresszum
          </a>
        </span>
      </footer>
      <SiteDock />
      <CustomCursor />
    </>
  );
}
