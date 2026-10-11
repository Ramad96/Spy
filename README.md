# Spy

A pass-the-phone party game of secret words and hidden spies. No server, no accounts, works offline.

Live at **https://spy.amanahdigital.co.uk**

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

Every push to `main` runs `.github/workflows/deploy.yml`: lint, test, build, then publish `dist/` to GitHub Pages.
`public/CNAME` sets the custom domain.

One-time setup:

1. **GitHub → Settings → Pages:** Source = **GitHub Actions**, custom domain = `spy.amanahdigital.co.uk`.
2. **DNS (Cloudflare, amanahdigital.co.uk):** add a `CNAME` record `spy` → `ramad96.github.io`.
   Set it to **DNS only** (grey cloud) so GitHub can issue the HTTPS certificate.
3. Once the certificate is issued, tick **Enforce HTTPS** in the Pages settings.

## Install on a phone

The site is a PWA. After the first visit it works with no internet.

- **iPhone (Safari):** Share → Add to Home Screen.
- **Android (Chrome):** menu → Install app / Add to Home screen.
