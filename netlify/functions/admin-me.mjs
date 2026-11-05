// GET /api/admin/me → 200 when the session cookie is valid
import { guarded, json } from "../lib/auth.mjs";

export default guarded(async () => json({ ok: true }), { method: "GET" });

export const config = { path: "/api/admin/me" };
