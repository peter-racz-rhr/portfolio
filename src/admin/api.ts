// Calls to the admin Netlify functions. The session lives in an HttpOnly cookie
// the browser sends automatically; nothing secret is stored in JavaScript.

import type { Content } from "@/lib/content";

/** `next dev` has no Netlify functions, so the editor runs without login and can't publish. */
export const LOCAL_DEV = process.env.NODE_ENV === "development";

async function call<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/admin/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

export const isLoggedIn = () => call<{ ok: true }>("me").then(() => true, () => false);
export const login = (password: string) => call<{ ok: true }>("login", { password });
export const logout = () => call<{ ok: true }>("logout", {});

/** Uploads one image to the repo's object store; returns its blob id for the publish commit. */
export const uploadImage = (path: string, dataUrl: string) =>
  call<{ sha: string }>("upload", { path, base64: dataUrl.slice(dataUrl.indexOf(",") + 1) });

export const publish = (content: Content, images: { path: string; sha: string }[]) =>
  call<{ commit: string; url: string }>("publish", { content, images });
