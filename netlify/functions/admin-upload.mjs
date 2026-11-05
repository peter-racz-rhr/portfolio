// POST /api/admin/upload { path, base64 } → stores one picture in the repo's object
// store (not committed yet) and returns its id for the publish commit.
import { guarded, json } from "../lib/auth.mjs";
import { createBlob, UPLOAD_PATH } from "../lib/github.mjs";

const MAX_BASE64 = 4_500_000;

export default guarded(async (req) => {
  const { path, base64 } = await req.json();
  if (typeof path !== "string" || !UPLOAD_PATH.test(path)) return json({ error: "Unexpected picture name." }, 400);
  if (typeof base64 !== "string" || !base64 || base64.length > MAX_BASE64) return json({ error: "Picture is too big." }, 413);
  if (!Buffer.from(base64.slice(0, 8), "base64").subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])))
    return json({ error: "Only JPEG pictures are accepted." }, 400);
  return json({ sha: await createBlob(base64) });
});

export const config = { path: "/api/admin/upload" };
