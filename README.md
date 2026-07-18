# Movez Ventures — local preview

Static export of the Movez site, built to run fully offline from `dist/`.

## Quick start

```bash
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:3000`).

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Download assets, merge CSS, patch HTML into `dist/` |
| `npm run dev` | Build + serve `dist/` locally |
| `npm start` | Same as `npm run dev` |

## What the build does

1. Copies theme JS, SVGs, and overrides into `dist/`
2. Downloads images, fonts, and favicons from hypra.fund
3. Writes `dist/wp-content/themes/hypra_theme/style.css` (theme CSS + thesis typography)
4. Patches `dist/index.html` for local paths and removes WP Rocket lazy-load blockers

Edit source files in the project root (`index.html`, `style.css`, `thesis-overrides.css`), then run `npm run build` again.
