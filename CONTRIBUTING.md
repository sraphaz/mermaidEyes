# Contributing to MermaidLens

Thanks for wanting to contribute! This repo is designed for easy community extension.

## Theme contributions

1. Copy the template folder: `packages/themes/template` → `packages/themes/<your-theme-id>`.
2. Edit `theme.json` with your colors and metadata.
3. Ensure the theme id is unique, lowercase, and descriptive.
4. Open a PR with screenshots or sample Mermaid diagrams if possible.

## Preset contributions

1. Create a new folder under `packages/presets/<your-preset-id>`.
2. Add a `preset.json` with Mermaid directives.
3. Verify your preset by setting `mermaidlens.preset` in settings.

## Code contributions

- Follow existing TypeScript style.
- Run `npm run build` and `npm test` before opening a PR.
- O workflow de release só publica no Marketplace se todos os testes passarem (verde).
