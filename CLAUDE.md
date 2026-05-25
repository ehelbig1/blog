# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Evan Helbig's personal blog at [blog.evanhelbig.com](https://blog.evanhelbig.com) — a hand-rolled static site with a "Cyber-Security Noir" aesthetic. Vanilla HTML/CSS/JS, no build step, no framework. Deployed via GitHub Actions to GitHub Pages on every push to `main`.

## Local development

There is no build, lint, or test command. To preview locally you need a static server (NOT `file://`) because `scripts.js` does `fetch('/data/posts.json')`, which browsers block under the `file://` protocol:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

`package.json` exists but is essentially empty — there are no npm scripts.

## Deploy

`git push origin main` triggers `.github/workflows/deploy.yml`, which uploads the entire repo as a Pages artifact via `actions/deploy-pages@v4`. The `CNAME` file pins the custom domain to `blog.evanhelbig.com`.

## Architecture: things that aren't obvious from reading one file

### Posts are self-contained HTML with duplicated chrome
There is no templating engine. Each `posts/*.html` is a complete HTML document with its own copy of the header (logo, nav), footer (copyright, social links, RSS), and `<head>` metadata. **Site-wide changes to the wordmark, nav, footer, social URLs, or RSS feed link must be applied to `index.html`, `404.html`, AND every file in `posts/`** — the easiest way is `sed -i ''` across `posts/*.html` plus targeted edits to the two top-level pages.

### `data/posts.json` is the only registry the homepage reads
`scripts.js` fetches `/data/posts.json` on load and renders the grid from it. The variable `allPosts` inside `scripts.js` is just an in-memory cache — you do NOT need to edit `scripts.js` when adding a post. The `sitemap.xml` and `rss.xml` are independent manual updates (the homepage doesn't read them, but they affect SEO and subscribers). See `GUIDE.md` for the full new-post checklist.

### The homepage tag-filter buttons are hardcoded
`index.html`'s `#tag-filters` only exposes `Architecture`, `Research`, `Languages`. Posts tagged anything else (e.g. `Cryptography`, `DevSecOps`) are still rendered under "All" and are searchable, but won't have a dedicated filter button unless you add one to the HTML.

### `wasm-engine/` is not loaded by the live site
The Rust crate in `wasm-engine/` (and its built artifacts in `wasm-engine/pkg/`) is a reference implementation — nothing in `index.html`, `posts/*.html`, or `scripts.js` imports from it. The interactive console / policy simulators / encrypt button use the `wasmProxy` object inside `scripts.js`, which is a pure-JS simulation. Treat the Rust crate as documentation / a future migration target; do not assume changes there ship anywhere. Note: `wasm-engine/pkg/*.js` is a generated build artifact and may be out of sync with `wasm-engine/src/lib.rs` until you re-run `wasm-pack`.

### Brand strings live in many places
The wordmark `EVAN HELBIG`, the domain `blog.evanhelbig.com`, the copyright, and the GitHub/LinkedIn URLs are repeated across `index.html`, `404.html`, all `posts/*.html`, `rss.xml`, `sitemap.xml`, `robots.txt`, `CNAME`, `README.md`, `GUIDE.md`, `package.json`. A `grep -ri` audit after any branding change is wise.

## Visual identity

The "Cyber-Security Noir" aesthetic (dark mode, neon cyan `#00F5FF` and violet `#BF00FF` accents, glassmorphism, JetBrains Mono + Outfit typography, decryption animations on titles) is load-bearing for the brand. Keep it when adding new posts or components. See `GUIDE.md` for the imagery specs, pro-tip callout pattern, and typography rules.

## Content workflow

For the per-post checklist (HTML head metadata, posts.json fields, sitemap entry, RSS item formatting), follow `GUIDE.md`. It's the canonical reference for adding content; don't duplicate that here.
