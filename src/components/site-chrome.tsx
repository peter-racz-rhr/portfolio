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
      <footer className="px-5 pt-10 pb-32 font-mono text-[11px] tracking-wider text-fg/40 uppercase sm:px-8">
        © 2026 Peter Racz · interactions inspired by Skiper UI &amp; Aceternity UI
      </footer>
      <SiteDock />
      <CustomCursor />
    </>
  );
}
