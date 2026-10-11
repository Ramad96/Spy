# Agent guidelines

- Read docs/RULES.md before coding.
- All game rules go in src/core. No React or browser code there.
- core never calls Math.random() directly; randomness is passed in.
- Write tests for every rule change. Run them before finishing.
- Mobile-first. Big tap targets (at least 48px).
- Keep the secret agent theme in src/theme; screens use its tokens.
- Keep changes small. Explain what you changed in 3 bullets.

## Commands

- `npm run dev` – local dev server
- `npm test` – run Vitest once
- `npm run lint` – ESLint
- `npm run build` – type-check and build to `dist/`

## Hosting

GitHub Pages via `.github/workflows/deploy.yml`, custom domain `spy.amanahdigital.co.uk` (see `public/CNAME`).
