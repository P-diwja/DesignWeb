# Blockwise — Visual Page Builder

> A drag-and-drop, AI-powered page builder. Build landing pages visually, export clean HTML, deploy anywhere.

🔗 **Live Demo:**
[design-bsv8667y8-pdiwja-3516s-projects.vercel.app](https://design-bsv8667y8-pdiwja-3516s-projects.vercel.app/)

![Blockwise](https://img.shields.io/badge/Built%20with-React%20%2B%20Vite-7c6af7?style=flat-square) ![Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-38bdf8?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧱 12 Block Types | Header, Navbar, Hero, Row, Button, Text, Image, Cards, Testimonial, Form, Divider, Footer |
| 🖱 Drag & Drop | Drag blocks from palette, reorder on canvas |
| 🎨 Property Editor | Edit colors, text, layout, fonts per block |
| 🖼 Background Image | URL or file upload + overlay color + opacity on any block |
| ⊞ Row / Columns | Side-by-side blocks in 2–4 columns |
| 🔢 Block Layering | Overlap blocks (text over image) with z-index + offset controls |
| 📐 Block Resize | Drag right edge to resize block width |
| 🔍 Canvas Zoom | 25%–150% zoom slider to see the full page |
| ✦ AI Enhance | Rewrite any block's content using Claude AI |
| ↩ Undo / Redo | 50-step history, Ctrl+Z / Ctrl+Y |
| 📱 Responsive Preview | Desktop / Tablet / Mobile canvas modes |
| 💾 Save & Load | Save project as JSON, auto-save to localStorage |
| 📤 Export HTML | One-click self-contained HTML file |
| 🖼 Save as Image | Export canvas as high-res PNG screenshot |
| ⌨ Keyboard Shortcuts | Del, Esc, Ctrl+Z, Ctrl+Y |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher

### Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/blockwise.git
cd blockwise

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📦 Deploy

### Vercel (Recommended — free)
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Vercel auto-detects Vite → click **Deploy**
4. Done — live URL in ~1 minute ✅

### Render
1. New Static Site on [render.com](https://render.com)
2. Build command: `npm run build`
3. Publish directory: `dist`

### Netlify
1. Run `npm run build` locally
2. Drag the `dist/` folder onto [netlify.com/drop](https://app.netlify.com/drop)

---

## 🗂 Project Structure

```
blockwise/
├── src/
│   ├── App.jsx                  # Root app + drag & drop wiring
│   ├── store/
│   │   └── BuilderStore.jsx     # Global state, undo/redo, localStorage
│   ├── components/
│   │   ├── Toolbar.jsx          # Top bar — preview, undo, save, export
│   │   ├── BlocksPalette.jsx    # Left sidebar — block list
│   │   ├── Canvas.jsx           # Middle — sortable blocks, zoom, resize
│   │   ├── BlockRenderer.jsx    # Renders each block as live React UI
│   │   └── PropertiesPanel.jsx  # Right panel — props editor + AI enhance
│   └── utils/
│       ├── blocks.js            # Block type definitions
│       ├── export.js            # HTML export generator
│       └── bgImage.js           # Background image style helpers
├── index.html
├── vite.config.js
└── vercel.json                  # Vercel routing config
```

---

## 🛠 Tech Stack

- **React 18** — UI
- **Vite** — Build tool
- **Tailwind CSS v4** — Styling
- **@dnd-kit** — Drag and drop
- **html2canvas** — Save as image
- **Claude API** — AI Enhance feature

---

## ⌨ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Delete` | Delete selected block |
| `Escape` | Deselect block |

---

## 📄 License

MIT — free to use, modify, and deploy.y [Claude](https://claude.ai)
