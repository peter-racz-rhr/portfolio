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

  if (state === "checking") return <div className="grid h-dvh place-items-center text-sm text-fg/50">Checking…</div>;
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
