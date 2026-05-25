# Blog Maintenance & Content Guide

This document outlines the workflow for creating high-fidelity technical articles for blog.evanhelbig.com and maintaining the "Cyber-Security Noir" aesthetic.

## 🚀 Post-Creation Checklist (Mandatory)

To ensure a new post is visible and discoverable, do all of the following:

1.  **`assets/<slug>_hero.png`**: Drop in a hero image (see Visual Guidelines below for specs).
2.  **`posts/<slug>.html`**: Create the post by duplicating an existing one and editing every spot listed in Step 2.
3.  **`data/posts.json`**: Append an entry so the homepage grid renders the new card.
4.  **`sitemap.xml`**: Append a `<url>` block for search-engine indexing.
5.  **`rss.xml`**: Prepend an `<item>` block so subscribers pick it up.
6.  **Preview locally** before pushing (see "Preview Locally" below).

---

## ✍️ Creating a New Blog Post

Content is handled through a "Static Registry" pattern: `scripts.js` fetches `/data/posts.json` at load time and renders the homepage grid from it. No JS edit is needed when adding a post.

### Step 1: Add the Hero Image

Place a hero image in `assets/` with a descriptive filename. Specs:

- **Dimensions**: 1024×1024 or 16:9.
- **Style**: Dark-mode aesthetic with neon accents (Cyan `#00F5FF`, Violet `#BF00FF`).
- **Format**: PNG, optimized (the homepage grid loads several at once).
- **Reference path** later: `assets/<slug>_hero.png` (no leading slash from `posts.json`, `../assets/...` from inside a post HTML file).

### Step 2: Create the HTML File

1.  Duplicate an existing post (e.g., `posts/zero-trust.html`) → `posts/<slug>.html`.
2.  Edit **every** one of these spots — most are easy to miss because the file is long:

    **`<head>`**
    - `<title>`: `<Post Title> | Evan Helbig`
    - `<meta name="description">`: 1-sentence summary (used by search engines).
    - `<meta property="og:title">`: same string as `<title>`.
    - `<meta property="og:description">`: same as the description (or a punchier social variant).
    - `<meta property="og:image">`: `../assets/<slug>_hero.png`.

    **`<body>`**
    - `.post-meta` triple — three `<span>`s: date (`Apr 28, 2026` format), tag (must match the `tag` you'll put in `posts.json`), read time (e.g. `8 min read`).
    - `.post-title` `<h1>` — contains **two** `<span class="decrypt" data-text="...">` halves. The `data-text` attribute MUST exactly match the visible text inside the span; the decryption animation reveals to whatever `data-text` says.
    - `.post-hero` `<img>` — update both `src` (`../assets/<slug>_hero.png`) and `alt` (descriptive, not the filename).
    - `.post-content` — your actual article body.

    **`<script>` tags at the bottom**
    - The template ships with `prism-javascript.min.js`. If your post uses other languages, add the matching Prism components, e.g.:
      ```html
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-rust.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js"></script>
      ```
      Without the right component, code blocks for that language render without syntax highlighting and you won't see an error.

3.  **Don't touch** the header, footer, social-link block, or `<div id="reading-progress">` / `<div class="bg-grid">` — that's site-wide chrome. If you change it in one post, you must change it in all of them and in `index.html` + `404.html`. See CLAUDE.md for the full list of files that carry brand strings.

### Step 3: Register in `data/posts.json`

Append one object to the array. **Required fields:**

| Field | Format / notes |
|---|---|
| `id` | Unique kebab-case slug. Match the filename. |
| `title` | Full title (no `| Evan Helbig` suffix here). |
| `excerpt` | 1-2 sentence summary shown on the homepage card. |
| `tag` | e.g. `Architecture`, `Research`, `Languages`, `Cryptography`, `DevSecOps`. The homepage filter buttons in `index.html` currently expose `Architecture`, `Research`, `Languages` — any other tag still works (searchable, shows under "All"), but won't get a dedicated filter unless you add a `<button>` to `#tag-filters` in `index.html`. |
| `date` | `Mon DD, YYYY` (e.g. `Apr 28, 2026`). |
| `readTime` | e.g. `12 min read`. |
| `image` | Path starting with `assets/` (no leading slash). |
| `url` | Path starting with `posts/`. |

### Step 4: SEO — `sitemap.xml`

Append a `<url>` block inside `<urlset>`. The `lastmod` is ISO-8601 (`YYYY-MM-DD`):

```xml
<url>
    <loc>https://blog.evanhelbig.com/posts/<slug>.html</loc>
    <lastmod>2026-05-28</lastmod>
    <priority>0.8</priority>
</url>
```

### Step 5: Subscribers — `rss.xml`

**Prepend** a new `<item>` to the top of the items list (most recent first). `pubDate` is RFC 822 (`Day, DD Mon YYYY HH:MM:SS +0000`):

```xml
<item>
    <title>Your Post Title</title>
    <link>https://blog.evanhelbig.com/posts/<slug>.html</link>
    <guid isPermaLink="true">https://blog.evanhelbig.com/posts/<slug>.html</guid>
    <pubDate>Thu, 28 May 2026 00:00:00 +0000</pubDate>
    <category>Architecture</category>
    <description><![CDATA[Same excerpt as data/posts.json.]]></description>
    <media:content url="https://blog.evanhelbig.com/assets/<slug>_hero.png" medium="image" />
</item>
```

Also bump `<lastBuildDate>` near the top of `rss.xml` to the same RFC 822 timestamp.

### Step 6: Preview Locally

`scripts.js` calls `fetch('/data/posts.json')`, which browsers block under `file://`. Run a static server from the repo root:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Verify:
- The new card appears on the homepage grid.
- Clicking through opens the post and the decryption animation runs on the `<h1>`.
- Code blocks have syntax colors (catches missing Prism language packs).
- The hero image loads (catches typos in the `assets/` path).
- The post search and tag filter both surface the new post.

### Step 7: Ship It

```bash
git add posts/<slug>.html assets/<slug>_hero.png data/posts.json sitemap.xml rss.xml
git commit -m "feat: add <slug> post"
git push origin main
```

Pushing to `main` triggers `.github/workflows/deploy.yml`, which redeploys the site to GitHub Pages within ~1 minute.

---

## 📡 Distribution Strategy

This blog follows a privacy-first distribution model. No third-party email trackers or centralized newsletter platforms.

- **RSS Feed**: Primary "push" mechanism. Readers are encouraged to use professional aggregators (Feedly, Inoreader, or CLI-based tools).
- **Social**: Manual updates are posted to GitHub and LinkedIn.

---

## 🎨 Visual Guidelines

To maintain the premium feel of the brand, follow these visual guidelines:

### 1. Typography & Hierarchy
- Use the `decrypt` class for main titles to enable the atomic scrambling animation. The `data-text` attribute must match the visible text exactly.
- Always wrap technical terms in `<code>` blocks.
- Use `<h2>` for section breaks and `<pre><code class="language-xyz">` for code snippets (and remember the matching Prism component in Step 2).

### 2. Imagery
- **Hero Images**: 1024×1024 or 16:9, dark-mode aesthetic with neon accents (Cyan `#00F5FF`, Violet `#BF00FF`).
- **Storage**: Always place images in the `assets/` directory with descriptive names.
- **Optimization**: Compress PNGs before pushing.

### 3. Special Components
- **Pro-Tips**: Use the standardized cyan-bordered callout for critical insights:
  ```html
  <div class="pro-tip" style="background: rgba(0, 245, 255, 0.05); border-left: 4px solid var(--primary); padding: 1.5rem; margin: 2rem 0; border-radius: 4px;">
      <strong style="color: var(--primary); display: block; margin-bottom: 0.5rem;">HEADING</strong>
      <p>Content...</p>
  </div>
  ```

---

## 🚀 Best Practices

- **Technical Depth**: This blog is for developers. Avoid surface-level content; include code examples, architecture diagrams (Mermaid-style or images), and real-world tradeoffs.
- **Temporal Alignment**: Ensure dates are current. For the 2026 deployment, all content should reflect the state of the art as of the 2026 timeline.
- **Performance**: Optimize PNG assets before pushing. Keep the overall page load under 2 seconds.
- **Accessibility**: Every image MUST have a descriptive `alt` tag.

---
*© 2026 Evan Helbig.*
