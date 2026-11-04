// One-time helper: logs you in to Spotify and prints the refresh token for Netlify.
//
//   SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/spotify-token.mjs
//   (PowerShell: $env:SPOTIFY_CLIENT_ID="..."; $env:SPOTIFY_CLIENT_SECRET="..."; node scripts/spotify-token.mjs)
//
// Your Spotify app must list this exact Redirect URI: http://127.0.0.1:8888/callback
// Everything runs on your own computer; nothing is sent anywhere except Spotify.

import { createServer } from "node:http";
import { randomBytes } from "node:crypto";

const id = process.env.SPOTIFY_CLIENT_ID;
const secret = process.env.SPOTIFY_CLIENT_SECRET;
if (!id || !secret) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first (see SPOTIFY_SETUP.md).");
  process.exit(1);
}

const PORT = 8888;
const REDIRECT = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = "user-top-read user-read-currently-playing";
const state = randomBytes(12).toString("hex");

const authUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({ client_id: id, response_type: "code", redirect_uri: REDIRECT, scope: SCOPES, state });

const server = createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT);
  if (url.pathname !== "/callback") {
    res.writeHead(302, { Location: authUrl }).end();
    return;
  }
  if (url.searchParams.get("state") !== state || !url.searchParams.get("code")) {
    res.writeHead(400).end("Login was cancelled or didn't match. Close this tab and run the script again.");
    return;
  }

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code: url.searchParams.get("code"), redirect_uri: REDIRECT }),
  });
  const data = await tokenRes.json();

  if (!tokenRes.ok || !data.refresh_token) {
    res.writeHead(500).end("Spotify didn't return a token. Check the terminal.");
    console.error("Token exchange failed:", data);
  } else {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" }).end("Done. Go back to the terminal, then close this tab.");
    console.log("\nYour SPOTIFY_REFRESH_TOKEN (paste it into Netlify, keep it private):\n");
    console.log(data.refresh_token + "\n");
  }
  server.close();
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\nOpen this in your browser and log in to Spotify:\n\n  http://127.0.0.1:${PORT}/\n`);
});
