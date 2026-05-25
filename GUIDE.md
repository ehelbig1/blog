# Blog Maintenance & Content Guide

This document outlines the workflow for creating high-fidelity technical articles for blog.evanhelbig.com and maintaining the "Cyber-Security Noir" aesthetic.

## 🚀 Post-Creation Checklist (Mandatory)

To ensure a new post is visible and discoverable, you **must** update the following files every time:

1.  **`posts/[name].html`**: The actual content file.
2.  **`data/posts.json`**: Add the post metadata to the central registry (The site now fetches this dynamically).
3.  **`rss.xml`**: Add a new `<item>` to the feed for subscribers.
4.  **`sitemap.xml`**: Add the new URL for search engine indexing.

---

## ✍️ Creating a New Blog Post

Content is handled through a "Static Registry" pattern to ensure maximum performance and zero backend latency.

### Step 1: Create the HTML File
1.  Navigate to the `posts/` directory.
2.  Duplicate an existing post (e.g., `zero-trust.html`) to use as a template.
3.  Update the `<head>` metadata:
    *   `<title>`: `Title | Evan Helbig`
    *   `<meta name="description">`: Compelling excerpt.
    *   `og:image`: Path to the hero asset (e.g., `../assets/your-hero.png`).

### Step 2: Update the Global Registries
The site uses two registries to drive the UI. Both **must** be updated:

1.  **`data/posts.json`**: This is used for potential external integrations and as a data backup.
2.  **`scripts.js`**: Update the `allPosts` array at the top of the file. This drives the real-time gallery, tag filtering, and search engine.

**Required Fields:**
- `id`: Unique kebab-case string.
- `title`: Full title.
- `excerpt`: 1-2 sentence summary.
- `tag`: One of `Architecture`, `Research`, `Languages`, `Cryptography`.
- `date`: Format `Apr 28, 2026`.
- `readTime`: e.g., `12 min read`.
- `image`: Path starting with `assets/`.
- `url`: Path starting with `posts/`.

### Step 3: SEO & RSS Syndication
1.  **`sitemap.xml`**: Add the new URL with a `priority` of `0.8`.
2.  **`rss.xml`**: Add a new `<item>` block. This is our primary distribution channel for security engineers. Ensure the `pubDate` is in RFC 822 format (e.g., `Tue, 28 Apr 2026 00:00:00 +0000`).

---

## 📡 Distribution Strategy

This blog follows a privacy-first distribution model. No third-party email trackers or centralized newsletter platforms.

- **RSS Feed**: Primary "push" mechanism. Readers are encouraged to use professional aggregators (Feedly, Inoreader, or CLI-based tools).
- **Social**: Manual updates are posted to GitHub and LinkedIn.

---

To maintain the premium feel of the brand, follow these visual guidelines:

### 1. Typography & Hierarchy
- Use the `decrypt` class for main titles to enable the atomic scrambling animation.
- Always wrap technical terms in `<code>` blocks.
- Use `<h2>` for section breaks and `<pre><code class="language-xyz">` for code snippets.

### 2. Imagery
- **Hero Images**: Should be 1024x1024 or 16:9, following the dark-mode aesthetic with neon accents (Cyan: `#00F5FF`, Violet: `#BF00FF`).
- **Storage**: Always place images in the `assets/` directory with descriptive names.

### 3. Special Components
- **Pro-Tips**: Use the standardized cyan-bordered callout for critical security insights:
  ```html
  <div class="pro-tip" style="background: rgba(0, 245, 255, 0.05); border-left: 4px solid var(--primary); padding: 1.5rem; margin: 2rem 0; border-radius: 4px;">
      <strong style="color: var(--primary); display: block; margin-bottom: 0.5rem;">HEADING</strong>
      <p>Content...</p>
  </div>
  ```

---

## 🚀 Best Practices

- **Technical Depth**: This blog is for developers. Avoid surface-level content; include code examples, architecture diagrams (Mermaid-style or images), and real-world security tradeoffs.
- **Temporal Alignment**: Ensure dates are current. For the 2026 deployment, all content should reflect the state of the art as of the 2026 timeline.
- **Performance**: Optimize PNG assets before pushing. Keep the overall page load under 2 seconds.
- **Accessibility**: Every image MUST have a descriptive `alt` tag.

---
*© 2026 Evan Helbig.*
