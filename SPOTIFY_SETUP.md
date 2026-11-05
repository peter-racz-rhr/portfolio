# Live Spotify setup

The "On repeat" section on Home shows your top tracks from the last month, and the song
you're playing right now with a "Listening right now" label. A small Netlify function
(`netlify/functions/spotify.mjs`) talks to Spotify so your keys never reach the browser.

You only do this once. It takes about 10 minutes.

## 1. Create a Spotify app

1. Go to https://developer.spotify.com/dashboard and log in with your Spotify account.
2. Click **Create app**.
   - App name: `portfolio` (anything works)
   - App description: `Shows my music on my site`
   - Redirect URI: `http://127.0.0.1:8888/callback` (type it exactly, then click **Add**)
   - Which API/SDKs: tick **Web API**
3. Save, open the app, go to **Settings**. Copy the **Client ID**, and click
   **View client secret** to copy the **Client secret**.

Keep the client secret private. Don't paste it into chats or commit it to GitHub.

## 2. Get your refresh token (on your own computer)

In a terminal, in this project folder:

```bash
node scripts/spotify-token.mjs
```

It asks for the **Client ID**, then the **Client secret** (shown as `*` while you type).
Then open http://127.0.0.1:8888/ in your browser, log in to Spotify and click **Agree**.
The terminal prints your refresh token. Copy it.

## 3. Deploy with the function

Dragging a zip into Netlify Drop only uploads static files, so the function wouldn't run.
Deploy from GitHub instead (it also redeploys on every push):

1. Put this project in a GitHub repository (for example `peter-racz-rhr/portfolio`).
2. In Netlify: **Add new site → Import an existing project → GitHub**, pick the repo.
   The settings come from `netlify.toml` (build `npm run build`, publish `out`).
3. Before or after the first deploy, go to **Site configuration → Environment variables**
   and add these three. Tick **Contains secret values** for each and keep **Functions** in
   the scopes:

   | Key                     | Value                    |
   | ----------------------- | ------------------------ |
   | `SPOTIFY_CLIENT_ID`     | from step 1              |
   | `SPOTIFY_CLIENT_SECRET` | from step 1              |
   | `SPOTIFY_REFRESH_TOKEN` | from step 2              |

4. **Deploys → Trigger deploy → Deploy site** so the function picks up the variables.

## 4. Check it

Open `https://your-site.netlify.app/api/spotify`. You should see JSON with your tracks.
If you see `{"error": ...}`, the message says what's missing.

The site falls back to the hand-picked list in `src/lib/data.ts` (`tracks`) whenever
Spotify can't be reached, and in local development.

## Notes

- Spotify updates "top tracks" about once a day. "Listening right now" is checked on every
  visit, cached for about 15 seconds.
- To change the period: in `netlify/functions/spotify.mjs`, `time_range=short_term` is about
  4 weeks; `medium_term` is about 6 months, `long_term` about a year.
- If you ever reset the client secret in the Spotify dashboard, run step 2 again and update
  the Netlify variables.
