# NexaFlow Website

**Shubham Goyal** · [shubhamgoyal.0027@gmail.com](mailto:shubhamgoyal.0027@gmail.com) · WhatsApp: +91 90506 56846

A premium business agency website built with **Vite + Tailwind CSS v3**.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Vite 5](https://vitejs.dev/) | Build tool & dev server |
| [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first CSS (tree-shaken in prod) |
| [PostCSS + Autoprefixer](https://postcss.org/) | CSS processing |
| Vanilla JS (ES Modules) | All interactivity |

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (opens http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Deploy to Vercel (Recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Vercel auto-detects the `vercel.json` settings — just click **Deploy**
4. Add your custom domain in **Settings → Domains**

> The `vercel.json` is pre-configured with `npm run build` and `dist/` as output.

---

## Deploy to GitHub Pages

1. Install the GitHub Pages plugin:
   ```bash
   npm install -D gh-pages
   ```
2. Add to `package.json` scripts:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```
3. Run:
   ```bash
   npm run deploy
   ```
4. Go to **GitHub repo → Settings → Pages → Source: gh-pages branch**

> **Note:** For GitHub Pages with a custom domain, add a `CNAME` file in `public/` with your domain name.

---

## Project Structure

```
nexaflow-website/
├── index.html          ← HTML entry point (clean, no inline CSS/JS)
├── src/
│   ├── main.js         ← All JavaScript (ES modules)
│   └── style.css       ← All custom CSS + Tailwind imports
├── public/             ← Static assets (favicon etc.)
├── dist/               ← Production build output (git-ignored)
├── vite.config.js      ← Vite configuration
├── tailwind.config.js  ← Tailwind theme (colors, fonts, animations)
├── postcss.config.js   ← PostCSS pipeline
├── vercel.json         ← Vercel deployment config
├── package.json        ← Dependencies & scripts
└── .gitignore          ← Excludes node_modules, dist, .env
```

---

## Contact Form → WhatsApp Flow

The contact form does **not** require a backend. On submit:
1. Form data (name, email, phone, service, message) is collected
2. A formatted WhatsApp message is built using `*bold*` markdown
3. `encodeURIComponent()` safely encodes the message
4. `wa.me/919050656846?text=...` opens WhatsApp with it pre-filled
5. You just hit **Send** in WhatsApp

To switch to Supabase later, replace `handleFormSubmit` in `src/main.js` — no HTML changes needed.
