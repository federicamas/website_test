## Project Overview

This repository contains **Fabi's Fashionist Fantasy**, a client-side seasonal color analysis website.

- Stack: `Vite + React + TypeScript`
- Styling: CSS Modules plus CSS custom properties
- App goal: users pick `hair`, `skin`, and `eyes` colors and receive a best-fit 12-season palette
- Domain model: seasonal analysis is treated as a styling heuristic; OKLCH is used for color math

## Key Files

- `src/App.tsx`: page composition, controls, and results rendering
- `src/components/MinimalFigure.tsx`: interactive figure with click targets and color popovers
- `src/lib/color.ts`: HEX/RGB/OKLCH conversion utilities
- `src/lib/analyze.ts`: trait derivation and season scoring
- `src/lib/seasons.ts`: season centroids, copy, and palette templates

## Working Norms

- Preserve the current single-page structure unless a task clearly requires routing or multiple pages.
- Keep the UI fashion-forward and minimal; avoid generic dashboard styling.
- Prefer extending the existing analysis engine instead of replacing it with ad hoc if/else rules.
- Keep palette outputs structured as `neutral`, `signature`, `accent`, `metal`, and `avoid`.
- Maintain accessibility for both figure hotspots and mirrored input controls.

## Dev Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Tests: `npm test`
- Build: `npm run build`

## Notes

- The environment initially did not have `node` or `npm` on `PATH`; if commands fail again, verify Node installation first.
- Tests rely on `Vitest` and `@testing-library/react`.
