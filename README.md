# 🌳 Curupira Workbench v7

**`@curupira-labs/amazonia`** is a dual-runtime **Electron + Web** workspace action runner for modern monorepos. It combines a real terminal, package/action discovery, command palette flow, friendly output cards, local history and a DevTools-inspired interface.

This ZIP is incremental from v5 and preserves the full previous codebase. v7 adds the “brutal” layer: terminal orchestration, richer output intelligence, editor-target parsing, action graph UI and a testable persistence contract.

## ✨ What is inside

- Electron desktop runtime with secure preload bridge.
- Web runtime with WebSocket terminal/workspace bridge.
- React + TypeScript + Vite renderer.
- Tailwind dark-first UI with subtle neon forest styling.
- shadcn-style component primitives and cmdk command palette.
- Resizable panels via `react-resizable-panels`.
- Real terminal architecture through `node-pty` and xterm.
- Workspace scanner for `package.json`, `pnpm-workspace.yaml`, `turbo.json` and `nx.json`.
- Script actions grouped by package.
- Turbo-aware and Nx-aware generated actions.
- Action graph foundation.
- Friendly output cards with diagnostics and links.
- Parser for URL and `file:line:column` references.
- Tool-aware parsers for Vitest, TypeScript, ESLint, Turbo and Nx.
- Local analytics and feature flags for every major feature.
- SQLite/Drizzle persistence foundation plus testable repository contract.
- Vitest tests for scanner, runner, output, links, graph, terminal orchestration, editor targets and persistence.

## 🚀 Usage

```bash
pnpm install
pnpm dev:web
```

For Electron:

```bash
pnpm dev:electron
```

For full local web bridge + desktop flow:

```bash
pnpm dev:full
```

## 🧭 Daily workflow

1. Open the Workbench.
2. Click **Open Workspace**.
3. Select or type a workspace path.
4. Curupira scans packages and scripts.
5. Click any action in the sidebar.
6. A terminal tab opens in that package path and runs the command.
7. Friendly Output shows status, duration, exit code, diagnostics and links.
8. Use `Ctrl+K` to search packages and actions.

## 🧪 Tests

```bash
pnpm test
pnpm typecheck
```

## 🧱 Architecture

```text
src/
  analytics/      local tracking
  editor/         editor target parsing and command planning
  features/       feature flags
  main/           Electron host process
  output/         friendly parsers and cards
  persistence/    SQLite/Drizzle and repository contracts
  preload/        secure Electron IPC exposure
  renderer/       React UI
  runs/           action run planner
  server/         WebSocket web runtime host
  shared/         shared protocol and types
  terminal/       node-pty host and terminal orchestrator
  workspace/      scanner and action graph
```

## 🌿 v7 brutal additions

### Terminal Orchestrator

A deterministic session registry that tracks terminal lifecycle, output bytes, crash state and renderer-compatible tabs.

### Friendly Output v2

Tool-aware parser layer detects the likely producer of output and extracts diagnostics for TypeScript, Vitest, ESLint, Turbo and Nx.

### Editor Integration Foundation

`parseEditorTarget` and `createEditorCommandPlan` normalize `file:line:column` links and prepare commands for VSCode, Cursor, Windsurf or default handlers.

### DevTools-style Timeline

The output panel now includes a compact timeline view for recent runs.

### Action Graph UI

The center panel now shows a lightweight package-to-action graph without adding a heavy visualization dependency yet.

## 🧩 Feature flags

All new v7 behavior is guarded or represented in `src/features/feature-flags.ts`:

- `terminalOrchestrator`
- `terminalRestore`
- `friendlyOutputToolParsers`
- `actionGraph`
- `persistedTerminalTabs`
- `editorIntegration`
- `devtoolsTimeline`

## 📦 Package exports

```json
{
  ".": "./src/shared/index.ts",
  "./workspace": "./src/workspace/index.ts",
  "./runs": "./src/runs/index.ts",
  "./output": "./src/output/index.ts",
  "./terminal": "./src/terminal/index.ts",
  "./editor": "./src/editor/index.ts",
  "./persistence": "./src/persistence/index.ts"
}
```

## 🛣️ Next v8 ideas

- Real persisted terminal restore from SQLite.
- Dedicated parsers with code frames for TypeScript, ESLint and Vitest.
- Action graph with dependency edges from Nx/Turbo metadata.
- Command palette sections for recent, favorite and failing actions.
- Editor opening via runtime bridge instead of command planning only.
- WebSocket reconnect with tab reattachment.
- Run comparison/baselines and flame timeline.

## 🌳 v8 Incremental Upgrade

Curupira Workbench v8 keeps the complete v7 codebase and adds the next layer of local intelligence instead of replacing the project with a tiny scaffold.

### New capabilities

- DevTools-style timeline data model with deterministic lanes for workspace, action, terminal, parser and persistence events.
- Terminal session recovery that restores persisted tabs safely and marks previously running processes as suspended.
- Local action suggestions powered by usage frequency, recency, success ratio and scanner weights.
- New reusable renderer panels for timeline lanes and suggested actions.
- Artifact validation script to prevent tiny placeholder ZIPs from being shipped again.

### Example: build a timeline

```ts
import { createDevtoolsTimeline } from '@curupira-labs/amazonia/timeline';

const snapshot = createDevtoolsTimeline([
  { id: 'scan', kind: 'workspace', label: 'Scan workspace', startedAtMs: 0, endedAtMs: 20 },
  { id: 'test', kind: 'action', label: 'pnpm test', startedAtMs: 20, endedAtMs: 120 },
]);
```

### Example: suggest frequent actions

```ts
import { suggestActions } from '@curupira-labs/amazonia/intelligence';

const suggestions = suggestActions(actions, usageSignals);
```

## 🌳 v9 — Indexed Workbench Intelligence

Curupira Workbench v9 keeps the complete v8 codebase and adds a stronger intelligence layer around action discovery, terminal recovery, layout safety and run attention scoring.

### New in v9

- **Action search index** shared by command palette, sidebar and hover cards.
- **Ranked command search** using exact, prefix, includes, kind and usage weight signals.
- **Terminal reconnect policy** for reload/WebSocket recovery decisions.
- **Run health summaries** for friendly output and timeline inspector panels.
- **Layout history normalization** to prevent corrupted persisted panel sizes from breaking the UI.
- **Run Inspector panel** component for the next UI integration pass.
- **Additional Vitest coverage** for action indexing, reconnect policy, run diagnostics and layout history.

### v9 usage examples

```ts
import { createActionIndex, searchActionIndex } from '@curupira-labs/amazonia/workspace';

const index = createActionIndex(workspace);
const matches = searchActionIndex(index, 'api test');
```

```ts
import { createReconnectQueue } from '@curupira-labs/amazonia/terminal';

const queue = createReconnectQueue(orchestrator.list());
```

```ts
import { summarizeRunHealth } from '@curupira-labs/amazonia/runs';

const health = summarizeRunHealth(card);
```


## v11 Brutal: product runtime pass

This version is intentionally built on top of the last complete base instead of replacing it with a tiny scaffold.

### What changed

- Added a typed runtime capability layer for Electron IPC vs WebSocket mode.
- Added WebSocket protocol validation before messages reach terminal/workspace services.
- Added a terminal command planner that centralizes tab ids, titles, terminal dimensions and cwd handling.
- Added a reusable terminal tabs bar with status pills and close support.
- Added a pure workbench state reducer for future store migration and better tests.
- Hardened Web mode bridge with a small send queue so early UI actions do not race the socket connection.
- Preserved the previous v10 snapshot under `docs/preserved-v10` because the earlier v10 ZIP existed and should not disappear.

### Run v11 locally

```bash
pnpm install
pnpm dev:product
```

For Electron-only development:

```bash
pnpm dev:desktop
```

For Web mode with the WebSocket terminal bridge:

```bash
pnpm dev:server
pnpm dev:web
```

### Validation

```bash
pnpm typecheck
pnpm test
pnpm test:v11
```

# 🌳 v12 Merge Recovery from v9 + v11

This build was created by unifying two ZIPs from the same project:

- Canonical base: `curupira-labs-amazonia-v11.zip`
- Secondary source: `curupira-labs-amazonia-v9.zip`

## Merge policy

- Preserve the latest functional v11 code as the main base.
- Bring back files that existed only in v9 when they were not junk/generated files.
- Keep v11 versions for conflicting files.
- Archive important v9 conflicting variants under `docs/merge-archive/v9-variants`.
- Remove obvious junk such as generated folders, logs, temporary files and caches.
- Record the merge in `CHANGELOG.md`.

## Merge summary

- Files only in v9 preserved: 81
- Important conflicting v9 variants archived: 0
- Identical shared files: 0
- Changed shared files where v11 was preferred: 0

# 🌳 Curupira Workbench v13 Brutal

This version connects the project’s action model to real terminal execution paths.

## Main focus

- Action click → terminal execution plan.
- Electron runtime → secure IPC handlers.
- Electron terminal backend → `node-pty` manager.
- Web runtime → WebSocket terminal bridge.
- Renderer → runtime-neutral terminal client.
- Renderer → terminal tabs state.
- Renderer → xterm host component.
- Usage persistence → frequency increments after action runs.
- Analytics → local action click/start events.

## Runtime flow

```ts
import { runWorkbenchAction } from './src/renderer/actions/run-action-controller';

await runWorkbenchAction({
  action,
  runtime: 'electron',
  terminalClient,
  store,
});
```

## Electron flow

```ts
import { registerTerminalIpc } from './src/main/ipc/register-terminal-ipc';

registerTerminalIpc({
  ipcMain,
  terminalManager,
});
```

## Web flow

```ts
import { startWorkbenchTerminalServer } from './src/server/workbench-terminal-server';

startWorkbenchTerminalServer({
  port: 17333,
  terminalManager,
});
```

## xterm view

```tsx
import { XtermTerminalView } from './src/renderer/terminal/XtermTerminalView';

<XtermTerminalView
  sessionId={session.id}
  onInput={(sessionId, data) => terminalClient.write(sessionId, data)}
  onResize={(sessionId, cols, rows) => terminalClient.resize(sessionId, { cols, rows })}
/>
```

## What should come next

v14 should polish the product layer:

1. Wire `ActionSidebar.onRunAction` directly to `runWorkbenchAction`.
2. Render `XtermTerminalView` in the active panel.
3. Stream terminal output into `parseFriendlyOutput`.
4. Render friendly output cards.
5. Persist terminal tabs and layout snapshots in SQLite/Drizzle.

# 🌳 Curupira Workbench v14-v15-v16

This release connects the v13 terminal bridge into the product UI and adds the promised product polish and DevTools-style intelligence.

## v14 — UI wiring final

- `WorkbenchShell` with resizable sidebar, terminal and friendly output panels.
- `WorkbenchController` connecting action ids to terminal execution.
- Friendly output cards fed by `parseFriendlyOutput`.
- Full renderer state reducer for actions, sidebar, terminal tabs, output cards and store updates.

## v15 — Product polish

- Ctrl+K command palette.
- Terminal tabs with close/restart controls.
- Layout snapshots.
- Terminal restore planning after reload.
- i18n messages for command palette and workbench panels.

## v16 — DevTools mode

- Run timeline model.
- Timeline panel grouped by run.
- Action graph model.
- Action graph panel with executable action nodes.

## Recommended next step

The next ZIP should focus on persistence hardening:

1. Real SQLite/Drizzle schema for layout, tabs, action frequency and runs.
2. Persist and restore `WorkbenchState`.
3. Wire terminal output events to timeline events.
4. Add editor opener for file links from friendly cards.

# 🌳 Curupira Workbench v17 Cleanup + Persistence

This release focuses on cleanup and durable state.

## Cleanup

- Preserved the v14-v15-v16 functionality.
- Scanned for exact duplicate files.
- Archived redundant low-value duplicates instead of blindly deleting source code.
- Added a cleanup validation manifest.
- Consolidated feature flags into a typed shared feature flag layer.

Exact duplicate files archived: **0**

## Persistence

- Added SQLite/Drizzle schema for:
  - key/value workbench state
  - action runs
  - terminal tabs
- Added database opener with WAL mode and bootstrap migration.
- Added repository helpers for:
  - loading/saving workbench state
  - saving/listing terminal tabs
  - saving action runs
- Added renderer hydration helpers.

## Clickable output foundations

- Added shared open target mapping for browser/editor targets.
- Added Electron opener for browser URLs and editor file locations.

## Tests

Added coverage for:

- cleanup report
- feature flags
- persisted state normalization
- hydration
- open target mapping

## Next recommended step

v18 should wire the repository into Electron startup and shutdown:

1. Open SQLite at app boot.
2. Hydrate renderer state from repository.
3. Save terminal tabs and layout on change.
4. Save action run status transitions.
5. Connect friendly output links to `openTarget`.

# 🌳 Curupira Workbench v18 REAL Full Wiring

This release does the no-compromise wiring pass: Electron main, preload, renderer runtime, persistence, openers, restore, autosave and timeline events now have real integration points.

## Electron main

- `bootstrapWorkbenchElectron` opens SQLite.
- Creates repository.
- Creates `NodePtyTerminalManager`.
- Registers terminal IPC.
- Registers persistence IPC.
- Registers opener IPC.
- Streams terminal data/status/exit into the renderer.
- Saves terminal session transitions.
- Emits timeline events from real terminal lifecycle.

## Preload

- `createWorkbenchFullApi` exposes:
  - terminal commands
  - terminal event subscriptions
  - persistence load/save/list calls
  - opener calls

## Renderer

- `createWorkbenchRuntimeApp` hydrates persisted state.
- Restores terminal tabs into renderer state.
- Wires action execution to the terminal client.
- Turns terminal output into friendly cards.
- Emits timeline events from terminal/output changes.
- `createWorkbenchAutosave` provides debounced persistence.

## Web mode

- `workbench-server.ts` starts a WebSocket terminal bridge.
- `createWebSocketTerminalTransport` adds reconnect + outbound buffering.

## Clickable output

- `openFriendlyOutputLink` maps parsed links to editor/browser targets through the preload API.

## Next recommended step

v19 should focus on true product hardening:

1. Persist timeline events to SQLite.
2. Make terminal output stream append to the active `XtermTerminalView`.
3. Add renderer-level event subscriptions to dispatch `terminal.session.upserted`.
4. Add integration tests for action click → terminal → output card → persisted state.

# 🌳 Curupira Workbench v19 Brutal Intelligence

This release upgrades the v19 seed into integrated product intelligence.

## Intelligence engine

- Frequency scoring.
- Recency decay.
- Current package/cwd context scoring.
- Search query scoring.
- Success/failure quality scoring.
- Intent inference for dev/test/build/lint/format/preview actions.
- Ranked action snapshots.
- Suggested action cards.

## UI integration

- Smart command palette powered by ranked actions.
- Suggested actions panel.
- Renderer intelligence view model from persisted store and current context.
- Intelligence controller result for cheap UI comparisons and memoization.

## Why this matters

The workbench now has enough signal to stop being a plain action list and start acting like a workspace assistant:

- recently used actions float up
- current package actions float up
- search results become contextual
- suggestions explain why they are suggested

## Next recommended step

v20 should connect this intelligence to live runtime events:

1. record `lastUsedAt` on action start
2. record success/failure on terminal exit
3. record average duration
4. show smart suggestions directly above the sidebar action list
5. use ranked actions inside Ctrl+K by default

# 🌳 Curupira Workbench v20 — UI absurda, timeline real e workspace graph

This release focuses on experience and visual intelligence.

## Premium UI

- Shared premium theme tokens.
- Reusable premium cards.
- Neon status pills.
- Brutal dashboard shell with layered glow, glass panels and live product metrics.

## Real timeline

- Visual timeline model with shared global time range, run lanes, scaled bar positions, severity detection and event markers.
- DevTools-style `RealTimelinePanel`.

## Workspace graph

- Graph domain model for root, packages, actions and tools.
- Weighted package centrality.
- Visual workspace graph panel with executable action nodes.

## Dashboard

`BrutalDashboard` combines smart suggestions, timeline, workspace graph and premium UI telemetry.

## Next recommended step

v21 should connect live data deeper: terminal runtime events into `RealTimelinePanel`, package dependency edges from `package.json`, graph filters and SQLite graph cache.

# 🌳 Curupira Workbench v22 — Vivid Hover, Folding, Graph Stream & Timeline

## Added

- Vivid diagnostic hover model.
- Vivid diagnostic hover card.
- Terminal section folding engine.
- Foldable terminal sections UI.
- Workspace graph stream reducer.
- Live workspace graph stream panel.
- Terminal frame/status timeline sync helpers.

## Next

v23 should wire these panels into the main dashboard shell and persist graph stream events in SQLite.

# 🌳 Curupira Workbench v23 CLEAN

This release applies the `/CLEAN` policy.

## Cleanup results

- Removed junk/generated folders: **0**
- Duplicate groups reported: **74**
- Single-file directories audited: **42**

Single-file folders were reported instead of moved blindly because imports must be rewritten safely. The next safe pass should use a TypeScript codemod to rewrite imports before moving files.

## New production utilities

- `src/shared/cleanup/v23-cleanup-audit.ts`
- `src/shared/performance/runtime-metrics.ts`
- `src/shared/examples/workbench-flow-example.ts`

## Validate

```bash
pnpm validate
```

# 🌳 Curupira Workbench v25 — Runtime Memory & Replay

## Added

- Runtime memory database.
- Replay sessions.
- Graph physics layout model.
- Runtime intelligence engine.
- Replay panel UI.
- Runtime memory/intelligence tests.

## Focus

The platform now evolves toward:
- persistent workspace memory
- replayable runtime sessions
- graph navigation
- intelligent runtime diagnostics

# 🌳 Curupira Workbench v26 — Live Runtime Brain

## Added

- Drizzle-ready runtime schema.
- Runtime intelligence v2.
- Semantic terminal parser.
- Runtime brain panel.
- Behavioral analytics tests.

## Focus

The platform now evolves toward:
- semantic runtime understanding
- workspace intelligence
- replayable observability
- runtime behavior analytics

# 🌳 Curupira Workbench v28 — REAL Integration

This release focuses on the requested real integration pass: UI polish, SQLite, terminal, Electron and wiring.

## What changed

### SQLite real

- Added Drizzle runtime schema.
- Added runtime SQLite bootstrap/migrations.
- Added runtime repository for:
  - runs
  - events
  - diagnostics
  - graph snapshots
  - terminal sections

### Terminal real

- Added `TerminalStreamFrame`.
- Terminal output is now transformed into:
  - raw stream
  - lines
  - semantic tokens
  - foldable terminal sections
- Added `RealTerminalSurface`, combining xterm and structured terminal sections.

### Electron real

- Added `bootstrapIntegratedElectronRuntime`.
- It wires:
  - workbench SQLite
  - runtime SQLite
  - node-pty terminal manager
  - terminal IPC
  - persistence IPC
  - opener IPC
  - integrated runtime store
  - renderer runtime events

### Wiring real

- Added `createIntegratedRuntimeStore`.
- Terminal data now feeds:
  - runtime store
  - terminal frames
  - timeline events
  - terminal section persistence
- Added preload `createIntegratedRuntimeApi`.

### UI polish real

- Added `IntegratedWorkbenchShell`.
- It brings together:
  - smart command palette
  - suggestions
  - sidebar
  - real terminal
  - terminal sections
  - real timeline
  - workspace graph
  - runtime brain

## Validate

```bash
pnpm validate
```

## Design note

This version intentionally refactors toward one integrated runtime path instead of adding parallel one-off panels.


# 🌳 Curupira Workbench v29 — Workspace Runtime Platform

## Added

- Runtime event bus.
- Runtime replay controller.
- Graph physics engine.
- Workspace dependency scanner.
- Plugin runtime registry.
- Replay controls UI.

## Runtime evolution

The platform now moves toward:
- runtime orchestration
- plugin extensibility
- synchronized replay
- graph physics rendering
- workspace dependency intelligence

# 🌳 Curupira Workbench v30 — Warp Terminal PTY

## Added

- Warp command block model.
- PTY runtime with command lifecycle.
- Warp terminal IPC handlers.
- Warp terminal preload API.
- Warp terminal view model.
- Warp-inspired terminal surface with:
  - xterm
  - fit addon
  - web links
  - command composer
  - command blocks
  - output search
  - status/duration metadata

## Next

- Persist command history and scrollback.
- Inline diagnostic hover cards inside command blocks.
- Replace older terminal panels with `WarpTerminalSurface`.

# 🌳 Curupira Workbench v32 — Terminal Replay Diagnostics

## Added

- Terminal Problems engine.
- Terminal Problems panel.
- Semantic terminal replay timeline.
- Semantic replay strip UI.
- Structured scrollback store.
- Tests for problems, replay and scrollback.

## Direction

This version ties the semantic terminal layer into practical UX:
- problems
- replay
- scrollback
- clickable diagnostic flows

# 🌳 Curupira Workbench v34 — Actionable Diagnostics

## Added

- Common error mapping for:
  - Node module errors
  - TypeScript compiler errors
  - npm/pnpm missing scripts
  - shell command-not-found
  - permission errors
  - port-in-use errors
- Actionable diagnostics engine.
- Pinned diagnostic commands.
- Editor-open command builder.
- Main-process diagnostic opener.
- Diagnostic IPC/preload API.
- Actionable diagnostics panel.
- Pinned commands panel.
- View model tying output lines, diagnostics and pinned commands together.

## UX

Each mapped error can now expose:

- Open in editor
- Pin fix command
- Run suggested command
- Copy/debug command
- Run again from pinned command

## Next

- Wire `ActionableDiagnosticsPanel` into `WarpTerminalSurface`.
- Persist pinned fix commands in SQLite.
- Add default editor configuration in settings.

# 🌳 Curupira Workbench v35 — Runtime Intelligence Wiring

## Added

- Runtime command lifecycle model.
- Runtime graph builder.
- Incremental runtime stream reducer.
- Runtime minimap.
- Runtime graph panel.
- Runtime lifecycle tests.

## Runtime Direction

The terminal/runtime architecture is now evolving toward:

- semantic runtime streams
- lifecycle-aware commands
- runtime graphs
- incremental rendering
- workspace intelligence

## Notes

Some runtime graph visualizations still use lightweight temporary renderers.

```ts
// TODO(runtime-graph): replace temporary list visualization with a real force-directed graph.
```

# 🌳 Curupira Workbench v36 — Xterm Addons

## Added

- Terminal addon type system.
- Terminal addon feature flags.
- Addon descriptors for:
  - attach
  - clipboard
  - fit
  - image
  - ligatures
  - progress
  - search
  - serialize
  - unicode-graphemes
  - unicode11
  - web-fonts
  - web-links
  - webgl
- Xterm addon bundle loader.
- Terminal addon controller.
- Terminal addon status panel.
- Addon-backed terminal component.
- Tests for addon config and load result types.

## Notes

`AttachAddon` is ready but requires the runtime WebSocket from web mode.

```ts
// TODO(addons): wire AttachAddon in web mode once the terminal WebSocket is provided by the runtime shell.
```

`WarpTerminalWithAddons` is the addon-backed surface and should replace older terminal internals after props are unified.

```ts
// REFACTOR(terminal): replace the older WarpTerminalSurface internals with this addon-backed surface once shell props are unified.
```

# 🌳 Curupira Workbench v37 — useXTerm Hook

## Added

- Robust reusable `useXTerm` hook.
- `XTerm` React component wrapper.
- Stable listener refs without stale callbacks.
- Disposable cleanup for xterm event listeners.
- Hook-backed addon controller.
- Hook-backed Warp terminal shell.
- Type tests for the hook and addon controller.

## Why

Terminal construction now has a reusable foundation instead of each component constructing xterm manually.

## TODO / REFACTOR markers

The new hook-backed terminal includes:

```ts
// TODO(terminal-wiring): replace remaining xterm construction sites with this hook-backed shell.
```

The addon controller hook includes:

```ts
// REFACTOR(terminal): once every terminal shell uses useXTerm, this hook should become the only addon entrypoint.
```

# 🌳 Curupira Workbench v38 — preserved-v10 cleanup

## Clean decision

`preserved-v10` was removed from the production artifact.

Why:

- It was a legacy preserved dump, not a real source package.
- It polluted the repository with generated `module_*.ts` style files.
- It created duplicate ownership and made the project look unfinished.
- Useful code must be migrated into `src` with tests, never kept as `preserved-v*`.

## Added

- Cleanup report: `docs/cleanup/v38-preserved-v10-cleanup.json`
- Guard helper: `src/shared/cleanup/preserved-folder-guard.ts`
- Test: `tests/preserved-folder-guard.test.ts`

## Policy

Future `/clean` runs should fail/report when `preserved-v*` folders appear in production artifacts.
