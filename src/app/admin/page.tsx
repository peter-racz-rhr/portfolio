"use client";

// WIREFRAME ONLY. Nothing here is saved or authenticated yet. The real
// version needs a backend (auth + database).

import { useState } from "react";
import { IconLock } from "@tabler/icons-react";
import { projects } from "@/lib/data";

const field =
  "w-full rounded-xl border border-fg/10 bg-fg/[0.04] px-4 py-3 text-fg placeholder:text-fg/30 outline-none transition-colors duration-150 focus:border-plum/60";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [shown, setShown] = useState<Record<string, boolean>>(
    Object.fromEntries(projects.map((p) => [p.slug, true])),
  );
  const [note, setNote] = useState("");

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pt-20 sm:px-8 sm:pt-28">
      <div className="mb-10 rounded-xl border border-dashed border-plum/40 px-4 py-3 font-mono text-xs tracking-wider text-plum uppercase">
        Wireframe: login and saving aren&apos;t connected yet
      </div>

      {!loggedIn ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLoggedIn(true);
          }}
          className="mx-auto max-w-sm space-y-3 pt-10"
        >
          <IconLock className="size-8 text-fg/40" stroke={1.5} />
          <h1 className="font-display text-3xl uppercase">Admin</h1>
          <p className="pb-2 text-fg/50">Only you get in here.</p>
          <input className={field} placeholder="Username" autoComplete="off" />
          <input className={field} placeholder="Password" type="password" autoComplete="off" />
          <button className="w-full rounded-xl bg-plum py-3 font-medium text-canvas transition-transform duration-150 ease-out active:scale-[0.98]">
            Log in (demo)
          </button>
        </form>
      ) : (
        <section>
          <div className="flex items-baseline justify-between">
            <h1 className="font-display text-2xl uppercase sm:text-3xl">Shown projects</h1>
            <button onClick={() => setLoggedIn(false)} className="font-mono text-xs text-fg/50 uppercase hover:text-fg">
              log out
            </button>
          </div>
          <p className="mt-2 text-fg/50">Pick which repos appear on the site.</p>
          <ul className="mt-6 space-y-2">
            {projects.map((p) => (
              <li key={p.slug}>
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-fg/10 px-4 py-3">
                  <span className="flex items-center gap-3">
                    <span className="size-3 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </span>
                  <input
                    type="checkbox"
                    checked={shown[p.slug]}
                    onChange={(e) => setShown((s) => ({ ...s, [p.slug]: e.target.checked }))}
                    className="size-4 accent-[var(--color-plum)]"
                  />
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setNote("Saving isn't wired up yet. This is the wireframe.")}
              className="rounded-xl bg-plum px-6 py-3 font-medium text-canvas transition-transform duration-150 ease-out active:scale-[0.98]"
            >
              Save
            </button>
            <span className="text-sm text-fg/50" aria-live="polite">
              {note}
            </span>
          </div>
        </section>
      )}
    </main>
  );
}
