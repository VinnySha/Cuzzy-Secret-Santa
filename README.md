# 🎁 Cuzzy Secret Santa 2025

A fun, interactive Secret Santa website for the cousins! Built with React, Vite, Tailwind CSS, and Framer Motion.

## Features

✨ **Core Features:**

- Add participant names (pre-filled with all 6 cousins)
- Fisher-Yates shuffle algorithm ensuring no self-assignments
- Individual private reveals per person
- Mobile-friendly design

🎨 **Fun Twists:**

- **Dramatic Reveal**: 3-second animated reveal with themed animations
- **Theme Toggle**: Switch between 🎄 Classic Christmas, ❄️ Winter Snow, and 🎉 Chaos Mode
- **Don't Peek Mode**: Assignments lock after 10 seconds and require a passcode to view again

💾 **Persistence:**

- LocalStorage saves your progress
- Can resume where you left off

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Build for Production

```bash
npm run build
```

The `dist` folder will contain the production-ready files.

### Preview Production Build

```bash
npm run preview
```

## Deployment

To deploy to `vinnysharma.dev`:

1. Build the project: `npm run build`
2. Upload the `dist` folder contents to your web server
3. Configure your server to serve `index.html` for all routes (for React Router compatibility)

### Quick Deploy Options

**Vercel:**

```bash
npm install -g vercel
vercel
```

**Netlify:**

```bash
npm install -g netlify-cli
netlify deploy --prod
```

**GitHub Pages:**

- Set `base: '/Cuzzy-Secret-Santa'` in `vite.config.js` (if using a subdirectory)
- Or use a GitHub Actions workflow

## How to Use

1. **Landing Page**: Click "Start the Chaos" to begin
2. **Add Names**: Add or remove cousin names (defaults are pre-filled)
3. **Finalize**: Click "Finalize & Shuffle!" when ready
4. **Reveal**: Each cousin clicks their name to reveal their assignment
5. **Lock**: After 10 seconds, the assignment locks (passcode: `cousins2025`)

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **LocalStorage** - State persistence

## Cousins (in age order)

Charvi, Rohan, Vinny, Isha, Praneil, Rohil

---

Made with ❤️ for the cousins 🎄
