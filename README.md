# Blockwise — Visual Page Builder

A drag-and-drop, AI-powered page builder built with React + Vite + Tailwind CSS.

## Features
- 10 block types: Header, Navbar, Hero, Text, Image, Card Grid, Testimonial, Contact Form, Divider, Footer
- Drag & drop to add and reorder blocks
- Per-block property editor (colors, text, layout)
- AI Enhance — rewrite block content with Claude AI
- Undo / Redo (50-step history)
- Block duplicate, delete, move up/down
- Desktop / Tablet / Mobile preview
- Canvas frame: background color, patterns (dots/grid/lines), corner radius
- Save project as JSON / Load project
- Auto-save to localStorage
- Export to self-contained HTML file
- Keyboard shortcuts: Ctrl+Z undo, Ctrl+Y redo, Delete block, Escape deselect

## Deploy

### Vercel (recommended)
1. Push to GitHub
2. Import repo on vercel.com
3. Framework: Vite — auto-detected
4. Deploy

### Render
1. New Static Site
2. Build command: `npm run build`
3. Publish directory: `dist`

### GitHub Pages
```bash
npm run build
# push dist/ contents to gh-pages branch
```

## Local Dev
```bash
npm install
npm run dev
```
