// Admin session: a signed, expiring token in an HttpOnly cookie that only the
// /api/admin/* functions receive. Signing key comes from ADMIN_PASSWORD (plus an
// optional SESSION_SECRET), so changing the password logs every session out.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const sha256 = (s) => createHash("sha256").update(s).digest();

function key() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD isn't set in Netlify");
  return sha256(`session:${password}:${process.env.SESSION_SECRET ?? ""}`);
}

const sign = (payload) => createHmac("sha256", key()).update(payload).digest("base64url");

export function checkPassword(given) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || typeof given !== "string") return false;
  return timingSafeEqual(sha256(given), sha256(password));
}

export function sessionCookie() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  return `${COOKIE}=${token}; Path=/api/admin; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Strict`;
}

export const clearCookie = () => `${COOKIE}=; Path=/api/admin; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;

export function isAuthed(req) {
  try {
    const raw = req.headers.get("cookie") ?? "";
    const token = raw
      .split(/;\s*/)
      .find((c) => c.startsWith(`${COOKIE}=`))
      ?.slice(COOKIE.length + 1);
    if (!token) return false;
    const [payload, sig] = token.split(".");
    const expected = Buffer.from(sign(payload));
    const given = Buffer.from(sig ?? "");
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
    return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now();
  } catch {
    return false;
  }
}

export const json = (body, status = 200, headers = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

/** Wraps a handler: only POST/GET as allowed, and only for a logged-in session. */
export function guarded(handler, { method = "POST" } = {}) {
  return async (req) => {
    if (req.method !== method) return json({ error: "Method not allowed" }, 405);
    if (!isAuthed(req)) return json({ error: "You're logged out. Log in again." }, 401);
    try {
      return await handler(req);
    } catch (err) {
      return json({ error: err.message ?? "Something went wrong" }, 500);
    }
  };
}
