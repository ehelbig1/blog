# Evan Helbig | Personal Blog

A premium, high-fidelity blog platform built with a "Cyber-Security Noir" aesthetic, combining deep technical writing on software, systems, and security with an interactive, immersive user experience.

Live at: [blog.evanhelbig.com](https://blog.evanhelbig.com)
Source: [github.com/ehelbig1/blog](https://github.com/ehelbig1/blog)

## 🚀 Key Features

- **Cyber-Security Noir Design**: A bespoke, dark-mode design system using glassmorphism, glowing accents, and high-contrast typography.
- **Interactive Console**: A functional terminal easter egg (click the icon, bottom-right) with custom commands and secret discovery.
- **Atomic Decryption Engine**: Real-time character-scrambling animations on page titles for a high-tech "decryption" feel.
- **SEO & Performance Driven**: Includes a generated sitemap, robots.txt, and comprehensive Open Graph metadata for social sharing.
- **Automated Deployment**: Fully integrated GitHub Actions workflow for zero-downtime deployment to GitHub Pages on every push to `main`.

## 🛠 Tech Stack

- **Core**: Vanilla HTML5, CSS3, and Modern JavaScript (ES6+).
- **Styling**: Pure CSS (No frameworks) for maximum performance and design flexibility.
- **Typography**: Outfit, JetBrains Mono, and Roboto Mono via Google Fonts.
- **Code Highlighting**: Prism.js (Tomorrow Night theme).
- **Automation**: GitHub Actions (OIDC-based deployment).

## 📂 Project Structure

```text
├── index.html          # Homepage (hero, post grid, terminal, footer)
├── posts/              # Technical article HTML files
├── data/posts.json     # Post registry consumed by the homepage grid
├── scripts.js          # Core logic (Gallery, Terminal, Decryption)
├── styles.css          # Design system and layout
├── assets/             # Hero images and other brand assets
├── favicon.svg         # Brand asset
├── 404.html            # Themed not-found page
├── sitemap.xml         # SEO sitemap
├── robots.txt          # SEO crawler rules
├── rss.xml             # RSS feed for subscribers
├── CNAME               # GitHub Pages custom domain
├── wasm-engine/        # Reference Rust/WASM crate (not loaded by the live site)
└── .github/workflows/  # GitHub Actions Pages deployment
```

## 🚢 Deployment & Content Creation

The site is configured to deploy automatically via GitHub Pages.

- **Creating Content**: For a detailed walkthrough on writing new posts and maintaining design standards, see [GUIDE.md](./GUIDE.md).
- **Deployment**:
    1.  Make edits and verify locally.
    2.  `git add . && git commit -m "feat: add new post"`
    3.  `git push origin main`
- **Live**: Rebuilds automatically at `blog.evanhelbig.com` via GitHub Actions.

---
*© 2026 Evan Helbig.*
