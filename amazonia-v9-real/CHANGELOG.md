# Changelog

## v9.0.0

- Added action indexing and ranked action search.
- Added terminal reconnect policy and reconnect queue helpers.
- Added run health summaries and attention sorting.
- Added layout state normalization and bounded layout history.
- Added Run Inspector panel foundation.
- Added Vitest coverage for all new behavior.
- Preserved the full v8 codebase and applied changes incrementally.

## v8.0.0

- Preserved the v7 package as the base and applied an incremental upgrade.
- Added DevTools timeline normalization with lanes and run conversion helpers.
- Added terminal session recovery for persisted tabs and safe suspended-state restores.
- Added local action suggestions based on run frequency, recency and success ratio.
- Added renderer panels for timeline visualization and suggested actions.
- Added artifact validation script to catch suspiciously small ZIPs before delivery.
- Added Vitest coverage for timeline, suggestions and session recovery.


## v7.0.0

### Added
- Terminal Orchestrator with immutable session snapshots, lifecycle states and renderer tab conversion.
- Friendly Output v2 parser layer with tool detection for Vitest, TypeScript, ESLint, Turbo, Nx and generic output.
- Editor target parser and command planner for VSCode, Cursor, Windsurf and default handlers.
- DevTools-inspired `RunTimeline` component inside the Friendly Output panel.
- Lightweight `ActionGraphPanel` for package-to-action visualization.
- Testable persistence repository contract and memory implementation.
- New package exports: `./terminal`, `./editor`, `./persistence`.
- New feature flags for terminal restore, tool parsers, action graph, editor integration and timeline.
- New Vitest coverage for terminal orchestration, suite parsers, editor targets and persistence repositories.

### Changed
- Workbench layout now uses the Terminal Orchestrator rather than only ad-hoc tab arrays.
- Friendly Output cards now use the richer `createFriendlyOutputCard` pipeline.
- README expanded with v7 architecture, usage, exports and next roadmap.
- Package version bumped to `7.0.0`.

## v5.0.0

### Added
- Action Graph foundation.
- Clickable output link parser.
- Additional exports and tests.

## v3.0.0

### Added
- Dual-runtime Electron + Web architecture.
- React + Vite renderer.
- Workspace scanner.
- Terminal host foundation.
- Persistence, feature flags and analytics foundation.
