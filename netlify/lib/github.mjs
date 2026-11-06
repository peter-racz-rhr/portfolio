// Minimal GitHub "git data" client: upload blobs, then make one commit that
// updates the content file and adds pictures. Needs GITHUB_TOKEN with
// Contents read/write on the repo.

const API = "https://api.github.com";

/** Pictures from the editor are always /uploads/<id>-<name>.jpg */
export const UPLOAD_PATH = /^\/uploads\/[a-z0-9-]{1,80}\.jpg$/;

function config() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN isn't set in Netlify");
  return {
    token,
    repo: process.env.GITHUB_REPO ?? "peter-racz-rhr/portfolio",
    branch: process.env.GITHUB_BRANCH ?? "main",
  };
}

// Turn a GitHub error into something you can act on: which step failed, what
// permission GitHub wanted, and which token Netlify is actually using (last 4
// characters only), so a stale or wrong token is easy to spot.
function explain(res, data, method, path) {
  const { token, repo } = config();
  const kind = token.startsWith("github_pat_") ? "fine-grained" : token.startsWith("ghp_") ? "classic" : "unknown type";
  const which = `${kind} token …${token.slice(-4)}`;
  const base = `GitHub said ${res.status} on ${method} ${path}: ${data.message ?? "request failed"}`;
  const wanted = res.headers.get("x-accepted-github-permissions");
  if (res.status === 401) return `${base}. The ${which} is invalid or expired: make a new one and redeploy.`;
  if (res.status === 403 || res.status === 404)
    return `${base}. The ${which} can't write to ${repo}${wanted ? ` (GitHub wants: ${wanted})` : ""}. Give it Contents: Read and write on ${repo}, or if it's a classic token tick "repo". Then save it as GITHUB_TOKEN in Netlify (all scopes and deploy contexts) and redeploy.`;
  return base;
}

async function gh(path, init = {}) {
  const { token, repo } = config();
  const res = await fetch(`${API}/repos/${repo}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "portfolio-editor",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(explain(res, data, init.method ?? "GET", path));
  return data;
}

export async function createBlob(base64) {
  const { sha } = await gh("/git/blobs", { method: "POST", body: JSON.stringify({ content: base64, encoding: "base64" }) });
  return sha;
}

/**
 * files: [{ path, content }] for text or [{ path, sha }] for already-uploaded blobs.
 * Returns the new commit's sha and its page on GitHub.
 */
export async function commitFiles(message, files) {
  const { repo, branch } = config();
  const ref = await gh(`/git/ref/heads/${branch}`);
  const parent = ref.object.sha;
  const parentCommit = await gh(`/git/commits/${parent}`);

  const tree = await gh("/git/trees", {
    method: "POST",
    body: JSON.stringify({
      base_tree: parentCommit.tree.sha,
      tree: files.map((f) =>
        f.sha ? { path: f.path, mode: "100644", type: "blob", sha: f.sha } : { path: f.path, mode: "100644", type: "blob", content: f.content },
      ),
    }),
  });

  const commit = await gh("/git/commits", {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [parent] }),
  });

  await gh(`/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });
  return { sha: commit.sha, url: `https://github.com/${repo}/commit/${commit.sha}` };
}
