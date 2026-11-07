# Site editor (/admin) setup

`your-site.netlify.app/admin` opens an editor of your real site. Log in with your
password, then:

- **Click any text** on the page and type. Enter (or clicking away) keeps it, Esc undoes it.
- **Click a project card, photo, polaroid or song** to edit it in the panel on the right:
  change details, replace the picture, move it up/down, duplicate or delete it.
- **Add new ones** with the + next to Projects, Photos, Polaroids or Songs on the left.
- **Home sections**: move them up/down or hide them, and pick how many projects Home shows.
- **Site settings & links**: email, socials, the hero background picture.
- **Undo / redo** with the arrows or Ctrl+Z / Ctrl+Shift+Z.

Changes are kept as a draft in your browser until you press **Publish**. Publishing saves
them to GitHub as one commit (`src/content/site.json` plus any new pictures in
`public/uploads/`). Netlify rebuilds from that, and the live site updates in about 1–2 minutes.
Every publish is a commit, so you can always go back to an older version on GitHub.

## One-time setup (about 5 minutes)

### 1. Pick a password

Make it long. It's the only thing protecting the editor.

### 2. Make a GitHub token that can only touch this repo

1. GitHub → your avatar → **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**.
2. Name: `portfolio editor`. Expiration: up to you (when it expires, publishing stops
   working until you make a new one).
3. **Repository access → Only select repositories →** `portfolio`.
4. **Permissions → Repository permissions → Contents → Read and write.** Nothing else.
5. Generate and copy the token (it starts with `github_pat_`).

### 3. Add them to Netlify

**Site configuration → Environment variables → Add a variable**:

| Key              | Value                         |
| ---------------- | ----------------------------- |
| `ADMIN_PASSWORD` | your password from step 1     |
| `GITHUB_TOKEN`   | the token from step 2         |

Then **Deploys → Trigger deploy → Deploy site** so the functions pick them up.

Optional: `GITHUB_REPO` (default `peter-racz-rhr/portfolio`), `GITHUB_BRANCH` (default
`main`), `SESSION_SECRET` (any long random text, adds extra strength to the login cookie).

### 4. Try it

Open `/admin`, log in, change a word, press Publish. You'll get a link to the commit on
GitHub, and the change is live after Netlify finishes building.

## Good to know

- Logging in lasts 7 days on that browser. Changing `ADMIN_PASSWORD` logs everyone out.
- Pictures are shrunk in your browser before uploading (longest side 1800px, JPEG).
- If you edit code on your computer too, run `git pull` first, because the editor commits
  to the same repo.
- In local development (`npm run dev`) the editor opens without a password so you can try
  it, but Publish only works on Netlify.

## If Publish doesn't work: Download changes

The **Download changes** button (next to Publish, and on the red bar when publishing
fails) saves one file, `portfolio-changes-<date>.json`, to your Downloads. It holds all
your edits plus any new pictures. Send it to Claude (or tell Claude where it is), who runs:

```bash
node scripts/apply-export.mjs path/to/portfolio-changes-<date>.json
```

That checks the file, writes `src/content/site.json` and the pictures into `public/uploads/`,
and prints what changed. Then it gets committed and pushed like any other change, and
Netlify updates the site. Your edits also stay in the editor as a draft until then.
