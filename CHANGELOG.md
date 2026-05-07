# Changelog

## [Unreleased]

### Fixed

- Restored missing shared modules (`action-types`, `workbench-store`, terminal planner, output-parser barrel) so `pnpm typecheck` succeeds under `strict` + unused checks.
- Corrected TS types across renderer (`React.ReactElement`, `cmdk` imports, `Group` orientation for `react-resizable-panels` v4).
- Wired grouped package sidebar (`GroupedActionSidebar`), sidebar state (`searchQuery`, `selectedPackageId`), and workbench output cards with real `ParsedOutputSummary` mapping.
- Fixed `node-pty` spawn typing (`readonly` args), WebLinks addon handler, and semantic warp blocks severity checks.
- Aligned open-target helpers with `OutputLinkCandidate` (`kind` / `target`).
- Removed legacy `amazonia-v9-real` snapshot folder.
- Excluded `src/utils` (typed-native helper mirror) from root `tsc`; added `src/vite-env.d.ts` for Vite/client types.

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


## v11.0.0

### Added
- Typed runtime capability resolver for Electron and Web mode.
- WebSocket protocol validation for workspace and terminal messages.
- Terminal command planner for deterministic xterm/node-pty spawn requests.
- Terminal tabs bar with status pills and close handling.
- Workbench state reducer for tested UI state transitions.
- v10 snapshot preservation under `docs/preserved-v10`.

### Changed
- WebSocket bridge now queues messages until the socket is open.
- Workbench layout now uses the shared terminal command planner and reusable tabs bar.
- Web server validates client messages before dispatching them.

### Tests
- Added runtime capability tests.
- Added WebSocket protocol tests.
- Added terminal command plan tests.
- Added workbench state reducer tests.

## v12.1.0 - Merge v9 + v11

### Added

- Unified the uploaded `v9` and `v11` ZIPs as requested.
- Preserved unique non-junk files from v9.
- Added `src/shared/merge/merge-policy.ts` to document the ZIP merge strategy.
- Added `tests/merge-policy.test.ts`.

### Changed

- Chose v11 as the canonical base because it was identified as the last functional version.
- Kept v11 versions for changed overlapping files.
- Archived important v9 conflict variants under `docs/merge-archive/v9-variants`.

### Removed

- Skipped obvious generated junk from the merge, including `node_modules`, build outputs, caches, logs and temporary files.

### Merge summary

- Unique v9 files preserved: 81
- Important conflicting v9 variants archived: 0
- Shared identical files: 0
- Shared changed files resolved in favor of v11: 0

## v13.0.0 - Brutal Terminal Actions

### Added

- Runtime-neutral terminal protocol.
- Immutable terminal session snapshots.
- `NodePtyTerminalManager` for real Electron terminal sessions.
- Secure terminal IPC registration helpers.
- Preload-safe workbench terminal API.
- WebSocket terminal bridge for Web mode.
- Renderer terminal client for Electron and Web.
- xterm React host component with Fit and Web Links addons.
- Terminal tabs reducer.
- Action run controller that connects sidebar actions to terminal sessions.
- Local frequency increment after action run.
- Tests for runtime snapshots, terminal tabs, node-pty manager, WebSocket routing and action execution.

### Changed

- The action layer is now connected to terminal execution instead of being only structural.

### Merge note

- This release continues from the merged `v9 + v11` base and preserves the previous code while adding the v13 terminal/action bridge incrementally.

### Next

- v14 should connect the final UI wiring: sidebar click handler → terminal panel → friendly output cards → SQLite persistence.

## v14-v15-v16 - UI Wiring, Polish and DevTools Mode

### Added

- v14 Workbench shell with resizable panels.
- v14 Workbench controller for sidebar action execution.
- v14 Friendly output cards.
- v14 Global workbench reducer.
- v15 Ctrl+K command palette.
- v15 Terminal tabs bar with close/restart controls.
- v15 Layout snapshot helpers.
- v15 Terminal restore planning.
- v16 Run timeline model and panel.
- v16 Action graph model and panel.
- i18n messages for workbench and command palette.
- Vitest coverage for workbench state, controller, layout snapshots, terminal restore, timeline and action graph.

### Changed

- Product flow is now wired beyond protocol: actions can flow into terminal UI state and friendly output cards.

### Next

- Persist these flows with SQLite/Drizzle and connect friendly output links to editor/browser openers.

## v17.0.0 - Cleanup, Deduplication and Persistence

### Added

- Typed cleanup report helper.
- Typed shared feature flags.
- SQLite/Drizzle schema for workbench state, action runs and terminal tabs.
- SQLite database opener with WAL mode and bootstrap migration.
- Workbench repository for state, terminal sessions and action runs.
- Renderer hydration planner.
- Shared open target mapper for browser/editor links.
- Electron open target helper.
- Tests for cleanup, feature flags, persistence normalization, hydration and open targets.

### Changed

- Consolidated feature flag behavior into `src/shared/feature-flags/feature-flags.ts`.
- Cleanup process now archives exact low-value duplicates instead of deleting potentially useful source code.
- README documents the duplicate cleanup and persistence strategy.

### Removed

- Archived redundant exact duplicates under `docs/cleanup-archive/exact-duplicates` when safe.

### Cleanup summary

- Exact duplicate files archived: 0
- Functionality preserved from v14-v15-v16.

## v18.0.0 - REAL Full Wiring

### Added

- Electron bootstrap wiring for database, repository, terminal manager, IPC and openers.
- Persistence IPC handlers.
- Opener IPC handlers.
- Main-process timeline bridge.
- Full preload API with terminal events, persistence and openers.
- Renderer runtime app with hydration, persistence and timeline updates.
- Debounced autosave controller.
- Friendly output link opener.
- Reconnecting/buffering WebSocket transport.
- Web terminal server entrypoint.
- Tests for persistence IPC, preload API, runtime hydration, autosave, output link openers and WebSocket buffering.

### Changed

- v18 is no longer a checkpoint copy. It wires Electron and renderer integration points directly over the v17 persistence foundation.

### Next

- Persist timeline events and connect terminal event subscriptions to live xterm writes in the React tree.


## v19 seed - intelligence
- basic action ranking system

## v19.0.0 - Brutal Intelligence Integrated

### Added

- Action intelligence domain types.
- Integrated action ranking engine with frequency, recency, context, query, success and failure signals.
- Intent inference for common workspace actions.
- Suggestion generation with human-readable reasons.
- Renderer intelligence view model.
- Intelligence controller result helper.
- Smart command palette.
- Suggested actions panel.
- i18n messages for intelligence and smart command palette.
- Tests for ranking, suggestions, view model and controller integration.

### Changed

- The original v19 seed ranking is now superseded by the full intelligence snapshot model.
- Command palette can now consume ranked/suggested actions instead of raw action order.

### Next

- Persist runtime quality signals: last used, success/failure and average duration.

## v20.0.0 - Premium UI, Real Timeline and Workspace Graph

### Added

- Premium UI token system.
- Reusable `PremiumCard`.
- Reusable `NeonStatusPill`.
- Visual timeline model with scaled lanes.
- Real timeline panel.
- Workspace graph domain model.
- Workspace graph builder.
- Central package detection.
- Workspace graph panel.
- Brutal dashboard shell.
- v20 i18n messages.
- Tests for premium theme, visual timeline and workspace graph.

### Changed

- The product now has a dedicated premium dashboard layer instead of isolated panels only.

### Next

- Wire package dependency edges and persist graph cache in SQLite.

## v22.0.0 - Vivid Hover, Terminal Folding, Graph Stream and Timeline Sync

### Added

- Vivid diagnostic hover model.
- Vivid diagnostic hover card.
- Terminal section folding engine.
- Foldable terminal sections UI.
- Workspace graph stream reducer.
- Live workspace graph stream panel.
- Terminal frame/status timeline sync helpers.
- Tests for hover cards, folding, graph stream and timeline sync.

## v23.0.0 - CLEAN Production Readiness

### Added

- `/CLEAN` audit report at `docs/cleanup/v23-cleanup-report.json`.
- Cleanup audit helpers.
- Runtime performance metric helpers.
- Concrete workbench flow example.
- Tests for cleanup audit, runtime metrics and action-to-terminal example.
- `pnpm validate` script.

### Changed

- Normalized package scripts for production usage.
- README now includes concrete current implementation examples.
- Cleanup policy now favors safe reporting over destructive source moves.

### Removed

- Removed junk/generated folders when found.

### Cleanup Summary

- Removed junk/generated folders: 0
- Duplicate groups reported: 74
- Single-file directories audited: 42

## v25.0.0 - Runtime Memory & Replay

### Added

- Runtime memory database.
- Runtime replay session model.
- Graph physics layout snapshot.
- Runtime intelligence engine.
- Runtime replay panel.
- Runtime memory and intelligence tests.

### Next

- SQLite persistence wiring.
- Real graph physics renderer.
- Runtime replay animation.
- Intelligent recommendations.

## v26.0.0 - Live Runtime Brain

### Added

- Drizzle-ready runtime schema.
- Runtime intelligence v2.
- Semantic terminal parser.
- Runtime brain panel.
- Runtime intelligence and parser tests.

### Next

- Real SQLite persistence wiring.
- Graph physics renderer.
- Timeline animation engine.
- Plugin API.

## v28.0.0 - REAL Integration

### Added

- Real runtime SQLite schema.
- Runtime SQLite database bootstrap and migrations.
- Runtime SQLite repository.
- Runtime persistence types.
- Terminal stream model.
- Real terminal surface with xterm + structured folding rail.
- Integrated runtime store.
- Integrated Electron runtime bootstrap.
- Integrated runtime preload API.
- Integrated polished workbench shell.
- Tests for SQLite migrations, terminal stream model, integrated runtime store, preload API and persistence types.

### Changed

- Runtime data flow is now unified through `createIntegratedRuntimeStore`.
- Terminal output is no longer only raw UI data; it becomes semantic, foldable and persistable.
- UI shell now ties intelligence, terminal, timeline, graph and runtime brain together.

### Next

- Replace older shell entrypoints with `IntegratedWorkbenchShell`.
- Add e2e tests for click action → node-pty → xterm → SQLite → timeline.
- Add graph dependency edges from package manifests.


## v29.0.0 - Workspace Runtime Platform

### Added

- Runtime event bus.
- Runtime replay playback controller.
- Graph physics simulation engine.
- Workspace dependency graph scanner.
- Workbench plugin runtime registry.
- Runtime replay controls.

### Changed

- Runtime architecture now favors event-driven orchestration.
- Replay infrastructure is now centralized through playback controllers.

### Next

- Timeline ↔ graph ↔ terminal synchronization.
- Physics renderer with viewport culling.
- Persistent terminal scrollback.
- Plugin sandbox runtime.

## v30.0.0 - Warp Terminal PTY

### Added

- Warp command block model.
- Warp PTY runtime.
- Warp terminal IPC handlers.
- Warp terminal preload API.
- Warp terminal view model.
- WarpTerminalSurface UI.
- Tests for command blocks, terminal view model and IPC handlers.

## v32.0.0 - Terminal Replay Diagnostics

### Added

- Terminal problems engine.
- Terminal replay timeline model.
- Terminal scrollback store.
- Problems panel UI.
- Semantic replay strip UI.
- Vitest coverage for problems, replay and scrollback.

### Next

- Wire Problems panel into `WarpTerminalSurface`.
- Persist scrollback chunks into SQLite.
- Add click-to-open diagnostic source flows.

## v34.0.0 - Actionable Diagnostics

### Added

- Actionable diagnostic types.
- Common Node/TypeScript/npm/pnpm/shell error mapping.
- Diagnostic location extraction.
- Pinned diagnostic command state.
- Actionable diagnostics engine.
- Editor open command builder.
- Main-process diagnostic opener.
- Diagnostic actions IPC handler.
- Diagnostic actions preload API.
- Actionable diagnostics panel.
- Pinned commands panel.
- Diagnostics view model.
- Tests for error mapping, dedupe, pinned commands and editor commands.

### Next

- Persist pinned diagnostic commands.
- Add click-to-open wiring inside terminal command blocks.
- Add package-manager-aware fix suggestions.

## v35.0.0 - Runtime Intelligence Wiring

### Added

- Runtime intelligence types.
- Runtime lifecycle reducer.
- Runtime workspace graph builder.
- Runtime stream reducer.
- Runtime minimap.
- Runtime graph panel.
- Tests for runtime lifecycle and graph.

### Changed

- Runtime architecture now supports structured command lifecycles and graph-based analysis.

### TODO

- Wire runtime graph into live PTY streams.
- Replace temporary graph rendering.
- Persist runtime graphs into SQLite.

## v36.0.0 - Xterm Addons

### Added

- Terminal addon registry/types/config.
- Full xterm addon dependency list.
- Addon bundle loader.
- Addon controller with fit/serialize/search helpers.
- Addon status panel.
- Addon-backed Warp terminal component.
- Tests for addon descriptors and load result types.

### TODO

- Wire WebSocket attach addon in web mode.
- Replace older terminal surface internals with addon controller.
- Persist serialized scrollback snapshots through SQLite runtime persistence.

## v37.0.0 - useXTerm Hook

### Added

- Reusable `useXTerm` hook.
- Reusable `XTerm` component.
- Stable xterm listener forwarding.
- Proper listener disposable cleanup.
- Hook-backed addon controller.
- Hook-backed Warp terminal shell.
- Type tests for hook APIs.

### Changed

- Terminal architecture now has a single reusable React xterm foundation.

### TODO

- Replace older terminal surfaces with hook-backed shell.
- Add integration test with PTY IPC and xterm input events.

## v38.0.0 - preserved-v10 cleanup

### Removed

- Removed `preserved-v10` legacy folder from the production ZIP.
- Removed stale generated `module_*.ts` style legacy files inside preserved snapshots.

### Added

- Preserved folder guard helper.
- Preserved folder guard test.
- Cleanup report at `docs/cleanup/v38-preserved-v10-cleanup.json`.

### Changed

- Production artifacts should no longer include legacy preserved source dumps.

### Cleanup Summary

- Removed preserved directories: 1
- Removed files from preserved snapshots: 81
- Duplicate preserved files detected before removal: 0
- Unique preserved files removed as stale legacy snapshot files: 81

### TODO

- TODO(cleanup): if future preserved folders contain real unique behavior, migrate that behavior into `src` with tests before deleting the preserved folder.
