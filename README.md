# Spy

A pass-the-phone party game of secret words and hidden spies. No server, no accounts, works offline.

Live at **https://amanahdigital.co.uk/games/spy/**

See [docs/RULES.md](docs/RULES.md) for the rules and [AGENTS.md](AGENTS.md) for development notes.

## Develop

```sh
npm install
npm run dev     # local dev server
npm test        # Vitest
npm run lint
npm run build   # type-check + production build (with service worker) to dist/
npm run preview # serve the production build
```

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`: lint, test, build, then publish `dist/` to GitHub Pages
(`ramad96.github.io/Spy/`, no custom domain). The main site's Worker (`AmanahDigitalHome/worker.js`) serves that
build at `amanahdigital.co.uk/games/spy/`, which is why `vite.config.ts` uses base `/games/spy/`.

## Install on a phone

The site is a PWA. After the first visit it works with no internet.

- **iPhone (Safari):** Share → Add to Home Screen.
- **Android (Chrome):** menu → Install app / Add to Home screen.
