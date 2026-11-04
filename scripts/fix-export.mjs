// The static export writes page prefetch data to `<route>/__next.<route>/__PAGE__.txt`,
// but the client router asks for `<route>/__next.<route>.__PAGE__.txt`. Copy each file to
// the flat name so in-app navigation stays instant on static hosts (Netlify, Pages, ...).
import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const out = new URL("../out/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory() || name === "_next") continue;
    const page = join(full, "__PAGE__.txt");
    if (name.startsWith("__next.") && existsSync(page)) {
      copyFileSync(page, join(dir, `${name}.__PAGE__.txt`));
    }
    walk(full);
  }
}

walk(out);
console.log("fix-export: flattened prefetch files");
