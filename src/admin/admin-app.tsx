"use client";

// /admin: checks the session cookie with the server, shows the login form or the editor.

import { useEffect, useState } from "react";
import { IconLock } from "@tabler/icons-react";
import { isLoggedIn, LOCAL_DEV, login } from "@/admin/api";
import { Editor } from "@/admin/editor";

export function AdminApp() {
  const [state, setState] = useState<"checking" | "out" | "in">(LOCAL_DEV ? "in" : "checking");

  useEffect(() => {
    if (LOCAL_DEV) return;
    isLoggedIn().then((ok) => setState(ok ? "in" : "out"));
  }, []);

  if (state === "checking") return <EditorSkeleton />;
  if (state === "out") return <Login onDone={() => setState("in")} />;
  return <Editor onLoggedOut={() => setState("out")} />;
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await login(password);
            onDone();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't log in.");
            setBusy(false);
          }
        }}
      >
        <IconLock className="size-8 text-fg/40" stroke={1.5} />
        <h1 className="font-display text-3xl uppercase">Editor</h1>
        <p className="text-fg/60">Only you get in here.</p>
        <label htmlFor="admin-password" className="sr-only">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-fg/15 bg-white px-4 py-3 outline-none focus:border-plum"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          disabled={busy || !password}
          className="w-full rounded-xl bg-plum py-3 font-semibold text-canvas transition-transform duration-150 ease-out active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? "Checking…" : "Log in"}
        </button>
      </form>
    </main>
  );
}

/* Rough outline of the editor while the login is checked */
function EditorSkeleton() {
  return (
    <div className="flex h-dvh flex-col bg-[#ece8e3]" aria-busy="true" aria-label="Loading editor">
      <div className="flex items-center gap-3 border-b border-fg/10 bg-white px-4 py-3">
        <div className="skeleton h-4 w-16 rounded-full" />
        <div className="skeleton ml-auto h-8 w-24 rounded-lg" />
        <div className="skeleton h-8 w-20 rounded-lg" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-64 flex-col gap-2 border-r border-fg/10 bg-white p-4 md:flex">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="skeleton h-7 rounded-lg" style={{ width: `${90 - (i % 3) * 18}%` }} />
          ))}
        </div>
        <div className="flex-1 space-y-6 bg-canvas p-8">
          <div className="skeleton h-[45%] rounded-[2rem]" />
          <div className="skeleton h-6 w-2/5 rounded-full" />
          <div className="grid grid-cols-3 gap-4">
            <div className="skeleton aspect-[4/3] rounded-3xl" />
            <div className="skeleton aspect-[4/3] rounded-3xl" />
            <div className="skeleton aspect-[4/3] rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
