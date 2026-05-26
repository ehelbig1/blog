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
`index.html`'s `#tag-filters` exposes a fixed set of buttons (`Architecture`, `Research`, `Languages`, `Cryptography`, `DevSecOps`). The filter logic in `scripts.js` is an exact match of `post.tag` against the button's `data-tag`. A post tagged with anything not in that list is still rendered under "All" and is searchable, but won't have a dedicated filter button unless you add one to the HTML.

### `wasm-engine/` IS loaded by the live site (with a JS fallback)
The Rust crate in `wasm-engine/src/lib.rs` compiles to `wasm-engine/pkg/` (committed) and powers the interactive console / policy simulators / encrypt button. `scripts.js` dynamically imports `/wasm-engine/pkg/blog_wasm_engine.js`, instantiates `BlogEngine`, and routes the `wasmProxy` methods (`genkey`/`verify`/`encrypt`/`evaluate`) through it. If the module fails to load, `wasmProxy` falls back to an equivalent pure-JS implementation in the same file — **keep the two paths in sync** when you change either.

To rebuild after editing `lib.rs`:
```bash
cd wasm-engine && wasm-pack build --target web --release
```
This regenerates `wasm-engine/pkg/` — commit it, since the no-build deploy ships the repo as-is. `wasm-engine/target/` is a Cargo build dir and is gitignored (do not commit it). `wasm-opt` is disabled in `Cargo.toml` because the binaryen download isn't always reachable; re-enable it if you want smaller `.wasm` output.

### Brand strings live in many places
The wordmark `EVAN HELBIG`, the domain `blog.evanhelbig.com`, the copyright, and the GitHub/LinkedIn URLs are repeated across `index.html`, `404.html`, all `posts/*.html`, `rss.xml`, `sitemap.xml`, `robots.txt`, `CNAME`, `README.md`, `GUIDE.md`, `package.json`. A `grep -ri` audit after any branding change is wise.

## Visual identity

The "Cyber-Security Noir" aesthetic (dark mode, neon cyan `#00F5FF` and violet `#BF00FF` accents, glassmorphism, JetBrains Mono + Outfit typography, decryption animations on titles) is load-bearing for the brand. Keep it when adding new posts or components. See `GUIDE.md` for the imagery specs, pro-tip callout pattern, and typography rules.

## Content workflow

For the per-post checklist (HTML head metadata, posts.json fields, sitemap entry, RSS item formatting), follow `GUIDE.md`. It's the canonical reference for adding content; don't duplicate that here.
