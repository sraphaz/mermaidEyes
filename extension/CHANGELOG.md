# Change Log

All notable changes to MermaidEyes are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.2.15] - 2026-01-28

### Fixed

- Activation test: mock output channel now includes `show()` so tests pass.

## [0.2.14] - 2026-01-28

### Added

- Hover provider logs to Output > MermaidEyes: each hover request (line:col), diagramOnHover value, and whether cursor is inside a mermaid block (for debugging).

### Changed

- **activationEvents:** Restored `*` so extension activates on startup (output and hover work reliably). Release workflow uses `--allow-star-activation` so vsce does not warn.

## [0.2.13] - 2026-01-28

### Fixed

- Output channel **MermaidEyes** now shows activation logs (extensionRoot, themeRoot, presetRoot, themes/presets count, welcome path). Panel is shown after activation so logs are visible.

## [0.2.12] - 2026-01-29

### Changed

- **activate():** Log "[MermaidEyes] activate() started" at start and "activate() completed" at end in Output > MermaidEyes. Whole activate() wrapped in try/catch; errors logged to Output and panel shown for debugging (hover/view not firing).
- **activationEvents:** Kept explicit so extension activates on startup, markdown, and commands.

## [0.2.11] - 2026-01-29

### Added

- Output channel **MermaidEyes** (View > Output) for debug: extensionRoot, themeRoot, presetRoot, welcome path, and loaded themes/presets count.
- Toggle **mermaideyes.diagramOnHover** default **true**: hover over Mermaid code in the editor shows the rendered diagram by default; can be turned off in settings.

### Fixed

- **View with MermaidEyes:** Pass document URI to `markdown.showPreviewToSide` so the preview opens for the correct file.
- BOM stripping when reading theme and preset JSON (core) to avoid encoding issues on Windows.

### Changed

- **Preview:** Always shows diagrams rendered—no placeholder. Toggle diagramOnHover only affects editor hover, not preview.
- Paths normalized with `path.resolve` for themes, presets, and welcome.
- Toggle description: when true (default), editor hover shows diagram; when false, no hover. Preview unaffected.

## [0.2.10] - 2026-01-29

### Fixed

- **Extension root path:** Use `__dirname` (code location) instead of `context.extensionPath` for themes, presets, and welcome path. Fixes hover, welcome page, and preview on first install when the extension is installed from Marketplace or VSIX.

### Changed

- Release workflow: verify `extension/packages/themes/ocean/theme.json` and `extension/packages/presets/none/preset.json` before packaging so the VSIX always includes them.

## [0.2.9] - 2026-01-29

### Fixed

- **Production (installed extension):** Theme and preset paths now correctly use the extension bundle (`packages/themes`, `packages/presets`) instead of mistakenly using `.vscode/extensions/packages/`. Fixes hover and View MermaidEyes when the extension is installed from the Marketplace or VSIX.

### Added

- Release workflow: verify README/CHANGELOG before packaging and check README inside VSIX (Marketplace overview).
- Extension `package.json`: explicit `readme` field for Marketplace overview.
- COMO_RODAR_LOCAL: note that `npm install` is required before build (fixes local "Cannot find module '@mermaideyes/core'").

### Changed

- Welcome page: logo image with centered layout and clip-path styling; fixed `alt` attribute typo.

## [0.2.8] - 2026-01-29

### Added

- CI and Release badges in extension README (green CI / green Release).

## [0.2.7] - 2026-01-29

### Changed

- Bump to trigger release; Marketplace overview and release notes (README + CHANGELOG) included in package.

## [0.2.6] - 2026-01-29

### Added

- Extension README for Marketplace overview (features, examples, configuration, CI/CD).
- CHANGELOG for release notes.
- Marketplace metadata: `keywords`, `galleryBanner`, `markdown: github` in `package.json`.

## [0.2.5] - 2026-01-29

### Changed

- Publisher set to `sraphaz`.
- Welcome page and docs updates.
- CI: Tag on version bump fetches remote tags before checking to avoid push conflict.
- README: Marketplace and Releases links.

## [0.2.4] - 2026-01-29

### Changed

- Release and CI workflow improvements.

## [0.2.3] - 2026-01-29

### Changed

- Theme and preset registry updates.

## [0.2.2] - 2026-01-28

### Changed

- Workflow and packaging fixes.

## [0.2.1] - 2026-01-28

### Changed

- Initial release flow and documentation.

[Unreleased]: https://github.com/sraphaz/mermaidEyes/compare/v0.2.12...HEAD
[0.2.12]: https://github.com/sraphaz/mermaidEyes/compare/v0.2.11...v0.2.12
[0.2.11]: https://github.com/sraphaz/mermaidEyes/compare/v0.2.10...v0.2.11
[0.2.10]: https://github.com/sraphaz/mermaidEyes/compare/v0.2.9...v0.2.10
[0.2.9]: https://github.com/sraphaz/mermaidEyes/compare/v0.2.8...v0.2.9
[0.2.8]: https://github.com/sraphaz/mermaidEyes/compare/v0.2.7...v0.2.8
[0.2.7]: https://github.com/sraphaz/mermaidEyes/compare/v0.2.6...v0.2.7
[0.2.6]: https://github.com/sraphaz/mermaidEyes/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/sraphaz/mermaidEyes/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/sraphaz/mermaidEyes/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/sraphaz/mermaidEyes/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/sraphaz/mermaidEyes/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/sraphaz/mermaidEyes/releases/tag/v0.2.1
