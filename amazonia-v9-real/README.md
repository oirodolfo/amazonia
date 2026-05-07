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
