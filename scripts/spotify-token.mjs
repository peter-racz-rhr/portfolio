// One-time helper: logs you in to Spotify and prints the refresh token for Netlify.
//
//   node scripts/spotify-token.mjs
//
// It asks for your app's Client ID and Client secret (the secret is hidden as
// you type). You can also pass them as SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET.
//
// Your Spotify app must list this exact Redirect URI: http://127.0.0.1:8888/callback
// Everything runs on your own computer; nothing is sent anywhere except Spotify.

import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline";

// One buffered reader for both questions, so pasted input is never lost between them
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
const lines = rl[Symbol.asyncIterator]();
const echo = rl._writeToOutput.bind(rl);
let muted = false;
// while muted, show a * for every typed character instead of the character
rl._writeToOutput = (s) => {
  if (!muted) echo(s);
  else if (!/[\r\n]/.test(s)) rl.output.write("*".repeat(s.length));
};

async function ask(question, { hidden = false } = {}) {
  process.stdout.write(question);
  muted = hidden;
  const { value } = await lines.next();
  muted = false;
  if (hidden) process.stdout.write("\n");
  return (value ?? "").trim();
}

const id = process.env.SPOTIFY_CLIENT_ID || (await ask("Spotify Client ID: "));
const secret = process.env.SPOTIFY_CLIENT_SECRET || (await ask("Spotify Client secret (hidden): ", { hidden: true }));
rl.close();
if (!id || !secret) {
  console.error("Both the Client ID and the Client secret are needed (see SPOTIFY_SETUP.md).");
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
