// POST /api/admin/publish { content, images: [{ path, sha }] } → one commit to GitHub
// with src/content/site.json and any new pictures in public/uploads. Netlify then
// rebuilds the site from that commit.
import { guarded, json } from "../lib/auth.mjs";
import { commitFiles, UPLOAD_PATH } from "../lib/github.mjs";

const REQUIRED = ["site", "hero", "home", "music", "contact", "projectsPage", "galleryPage", "about", "projects", "photos", "favPics", "tracks"];
const MAX_CONTENT = 400_000;

export default guarded(async (req) => {
  const { content, images = [] } = await req.json();

  if (!content || typeof content !== "object" || REQUIRED.some((k) => !(k in content)))
    return json({ error: "That doesn't look like the site content." }, 400);
  const text = JSON.stringify(content, null, 2) + "\n";
  if (text.length > MAX_CONTENT) return json({ error: "Content is unexpectedly large." }, 413);
  if (text.includes('"data:')) return json({ error: "A picture wasn't uploaded properly. Pick it again." }, 400);

  if (!Array.isArray(images) || images.some((i) => !UPLOAD_PATH.test(i?.path ?? "") || !/^[0-9a-f]{40}$/.test(i?.sha ?? "")))
    return json({ error: "Unexpected picture list." }, 400);

  const files = [
    { path: "src/content/site.json", content: text },
    ...images.filter((i) => text.includes(`"${i.path}"`)).map((i) => ({ path: `public${i.path}`, sha: i.sha })),
  ];
  const n = files.length - 1;
  const message = `Update site content from the editor${n ? ` (+${n} picture${n > 1 ? "s" : ""})` : ""}`;
  const { sha, url } = await commitFiles(message, files);
  return json({ commit: sha, url });
});

export const config = { path: "/api/admin/publish" };
