// GET /api/spotify — what's playing now, the songs played just before it, your top
// tracks from the last ~4 weeks, and your profile link.
// Needs three environment variables in Netlify (Site configuration → Environment variables):
//   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
// See SPOTIFY_SETUP.md for how to get them. The secret never reaches the browser.
// "Played before this" needs the user-read-recently-played permission; tokens made
// before it was added simply get `recent: null`, and the site shows top tracks instead.

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";
const RECENT_COUNT = 4;

async function accessToken() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!id || !secret || !refresh) throw new Error("Spotify environment variables are missing");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
  });
  if (!res.ok) throw new Error(`Spotify token request failed (${res.status})`);
  return (await res.json()).access_token;
}

const length = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

function toTrack(t) {
  return {
    title: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    album: t.album.name,
    length: length(t.duration_ms),
    durationMs: t.duration_ms,
    cover: t.album.images[0]?.url ?? null,
    url: t.external_urls.spotify,
  };
}

/** Newest first, without the song playing now and without repeats. */
function previousSongs(items, playingUrl) {
  const seen = new Set(playingUrl ? [playingUrl] : []);
  const out = [];
  for (const { track, played_at } of items) {
    const t = toTrack(track);
    if (seen.has(t.url)) continue;
    seen.add(t.url);
    out.push({ ...t, playedAt: played_at });
    if (out.length === RECENT_COUNT) break;
  }
  return out;
}

export default async () => {
  try {
    const token = await accessToken();
    const auth = { headers: { Authorization: `Bearer ${token}` } };

    const [topRes, nowRes, recentRes, meRes] = await Promise.all([
      fetch(`${API}/me/top/tracks?time_range=short_term&limit=6`, auth),
      fetch(`${API}/me/player/currently-playing`, auth),
      fetch(`${API}/me/player/recently-played?limit=10`, auth),
      fetch(`${API}/me`, auth),
    ]);
    if (!topRes.ok) throw new Error(`Top tracks request failed (${topRes.status})`);

    const tracks = (await topRes.json()).items.map(toTrack);

    // 204 = nothing playing
    let nowPlaying = null;
    if (nowRes.status === 200) {
      const now = await nowRes.json();
      if (now?.item && now.currently_playing_type === "track") {
        nowPlaying = { ...toTrack(now.item), isPlaying: now.is_playing, progressMs: now.progress_ms };
      }
    }

    // 403 = the token doesn't have the recently-played permission yet
    const recent = recentRes.ok ? previousSongs((await recentRes.json()).items ?? [], nowPlaying?.url) : null;

    return Response.json(
      {
        tracks,
        nowPlaying,
        recent,
        // your public profile link, so the site's Spotify button always points to you
        profileUrl: meRes.ok ? ((await meRes.json()).external_urls?.spotify ?? null) : null,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          // browsers re-ask every visit; Netlify's CDN reuses the answer for 15 seconds
          "Cache-Control": "public, max-age=0, must-revalidate",
          "Netlify-CDN-Cache-Control": "public, s-maxage=15, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
};

export const config = { path: "/api/spotify" };
