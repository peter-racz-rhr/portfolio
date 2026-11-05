// POST /api/admin/login { password } → sets the session cookie
import { checkPassword, json, sessionCookie } from "../lib/auth.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!process.env.ADMIN_PASSWORD) return json({ error: "The editor isn't set up yet: add ADMIN_PASSWORD in Netlify." }, 503);

  const { password } = await req.json().catch(() => ({}));
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return json({ error: "Wrong password." }, 401);
  }
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie() });
};

export const config = { path: "/api/admin/login" };
