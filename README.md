# unixawy.com — Personal Security & Engineering Blog

The official repository for [www.unixawy.com](https://www.unixawy.com), a personal technical cybersecurity blog authored by **Ahmad Mahfouz** (`_N1X_`).

Migrated from WordPress to a modern, static architecture powered by [Hugo](https://gohugo.io/) and the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme.

---

## 🛠️ Tech Stack & Features

- **Static Site Generator:** [Hugo](https://gohugo.io/) (Extended edition)
- **Theme:** [PaperMod](https://github.com/adityatelange/hugo-PaperMod) (Profile mode, responsive dark/light UI, fast full-text search)
- **Hosting & CI/CD:** GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)
- **DNS & Domain:** Custom domain via `static/CNAME` (`www.unixawy.com`)
- **SEO & Search Indexing:**
  - Automated XML sitemaps and RSS feeds
  - Preserved WordPress permalink routing (`url: "/<slug>/"`)
  - Permissive AI search crawler indexing (`GPTBot`, `ClaudeBot`, `PerplexityBot`) via `static/robots.txt`

---

## 📂 Repository Structure

```text
.
├── .github/workflows/deploy.yml   # Automated GitHub Pages CI/CD workflow
├── content/
│   ├── about.md                   # Author bio and executive profile
│   ├── search.md                  # Client-side full-text search layout
│   └── posts/                     # 60+ technical articles and exploit writeups
├── static/
│   ├── CNAME                      # Custom domain configuration (www.unixawy.com)
│   ├── robots.txt                 # Search engine and AI crawler rules
│   └── uploads/                   # Stored images, diagrams, and media assets
├── themes/
│   └── PaperMod/                  # Hugo PaperMod theme
└── hugo.toml                      # Global Hugo configuration
```

---

## 🚀 Local Development

To run the blog locally:

1. Install [Hugo](https://gohugo.io/installation/) (extended version recommended).
2. Clone the repository:
   ```bash
   git clone https://github.com/eln1x/unixawy.com.git
   cd unixawy.com
   ```
3. Start the local development server:
   ```bash
   hugo server -D
   ```
4. Open [http://localhost:1313](http://localhost:1313) in your browser.

---

## 📜 Deployment

Pushes to the `main` branch trigger the GitHub Actions workflow to build the Hugo site with minification and deploy the resulting artifacts directly to GitHub Pages.
