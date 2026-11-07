// Puts a file from the editor's "Download changes" button into the repo:
//
//   node scripts/apply-export.mjs <path-to-portfolio-changes-….json>
//
// Writes src/content/site.json and any new pictures to public/uploads/, then
// prints what changed. It doesn't commit; review with `git diff`, then commit.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_PATH = join(root, "src", "content", "site.json");
// same rules as the publish function (netlify/lib/github.mjs, admin-publish.mjs)
const UPLOAD_PATH = /^\/uploads\/[a-z0-9-]{1,80}\.jpg$/;
const REQUIRED = ["site", "hero", "home", "music", "contact", "projectsPage", "galleryPage", "about", "projects", "photos", "favPics", "tracks"];

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const file = process.argv[2];
if (!file) fail("Give the path to the downloaded file: node scripts/apply-export.mjs <file>");

let data;
try {
  data = JSON.parse(readFileSync(file, "utf8"));
} catch (err) {
  fail(`Couldn't read ${file} as JSON (${err.message}).`);
}

if (data?.format !== "portfolio-editor-export" || data.version !== 1) fail("That isn't a file from the editor's Download changes button.");
const { content, images = {} } = data;
if (!content || typeof content !== "object" || REQUIRED.some((k) => !(k in content)))
  fail(`The content is missing sections: ${REQUIRED.filter((k) => !(k in (content ?? {}))).join(", ")}`);

const text = JSON.stringify(content, null, 2) + "\n";
if (text.includes('"data:')) fail("The content has a picture embedded in it instead of a file path. Pick that picture again in the editor and re-download.");

// pictures: only the ones the content actually uses, only safe names, only real JPEGs
const written = [];
for (const [path, dataUrl] of Object.entries(images)) {
  if (!text.includes(`"${path}"`)) continue;
  if (!UPLOAD_PATH.test(path)) fail(`Unexpected picture name: ${path}`);
  const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl));
  if (!match) fail(`Picture ${path} isn't a JPEG.`);
  const bytes = Buffer.from(match[1], "base64");
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) fail(`Picture ${path} isn't a valid JPEG.`);
  const target = join(root, "public", ...path.split("/").filter(Boolean));
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, bytes);
  written.push(`${path} (${Math.round(bytes.length / 1024)} KB)`);
}

// every /uploads/ path the content uses must exist after this (new here, or already in the repo)
const missing = [...new Set(text.match(/"\/uploads\/[^"]+"/g) ?? [])]
  .map((s) => s.slice(1, -1))
  .filter((p) => {
    try {
      readFileSync(join(root, "public", ...p.split("/").filter(Boolean)));
      return false;
    } catch {
      return true;
    }
  });

let before = {};
try {
  before = JSON.parse(readFileSync(CONTENT_PATH, "utf8"));
} catch {}
const changed = Object.keys(content).filter((k) => JSON.stringify(content[k]) !== JSON.stringify(before[k]));

writeFileSync(CONTENT_PATH, text);

console.log(`\n✓ Applied changes exported ${data.exportedAt ?? "(no date)"}`);
console.log(`  Sections changed: ${changed.length ? changed.join(", ") : "none"}`);
console.log(`  Pictures added:   ${written.length ? "\n    " + written.join("\n    ") : "none"}`);
if (missing.length) console.log(`  ⚠ Pictures used but not found: ${missing.join(", ")}`);
console.log("");
