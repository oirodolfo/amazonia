import { parseFriendlyOutput } from '@/shared/output/output-parser';
import type { WorkbenchStoreSnapshot } from '@/shared/persistence/workbench-store';
import type { WorkbenchRuntime } from '@/shared/runtime/runtime-types';
import { runWorkbenchAction } from '@/renderer/actions/run-action-controller';
import type { WorkbenchTerminalClient } from '@/renderer/terminal/workbench-terminal-client';
import { findWorkbenchAction, type FriendlyOutputCard, type WorkbenchEvent, type WorkbenchState } from './workbench-state';

export interface WorkbenchController {
  runAction(actionId: string): Promise<void>;
  handleTerminalOutput(sessionId: string, title: string, data: string): void;
}

export interface CreateWorkbenchControllerOptions {
  readonly runtime: WorkbenchRuntime;
  readonly terminalClient: WorkbenchTerminalClient;
  readonly getState: () => WorkbenchState;
  readonly dispatch: (event: WorkbenchEvent) => void;
}

/**
 * Creates the UI controller that wires sidebar actions to terminal execution.
 *
 * @param options - Runtime, terminal client and state bindings.
 * @returns Workbench controller.
 *
 * @example
 * ```ts
 * const controller = createWorkbenchController({ runtime, terminalClient, getState, dispatch })
 * ```
 */
export function createWorkbenchController(options: CreateWorkbenchControllerOptions): WorkbenchController {
  return {
    async runAction(actionId) {
      const state = options.getState();
      const action = findWorkbenchAction(state, actionId);
      if (!action) throw new Error(`Action was not found: ${actionId}`);

      const result = await runWorkbenchAction({
        action,
        runtime: options.runtime,
        terminalClient: options.terminalClient,
        store: state.store,
      });

      options.dispatch({ type: 'store.updated', store: result.nextStore });
    },

    handleTerminalOutput(sessionId, title, data) {
      const summary = parseFriendlyOutput(data);
      if (summary.errors === 0 && summary.warnings === 0 && summary.links.length === 0) return;

      const card: FriendlyOutputCard = {
        id: `output_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        sessionId,
        title,
        summary,
        createdAt: Date.now(),
      };

      options.dispatch({ type: 'output.card.added', card });
    },
  };
}

/**
 * Restores a safe store shape from persisted JSON.
 *
 * @param value - Unknown persisted value.
 * @returns Safe workbench store snapshot.
 *
 * @example
 * ```ts
 * restoreWorkbenchStore(JSON.parse(raw))
 * ```
 */
export function restoreWorkbenchStore(value: unknown): WorkbenchStoreSnapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { actionFrequencies: {}, favoriteActionIds: [], pinnedPackageIds: [], layout: {} };
  }

  const candidate = value as Partial<WorkbenchStoreSnapshot>;
  return {
    actionFrequencies: isRecord(candidate.actionFrequencies) ? candidate.actionFrequencies : {},
    favoriteActionIds: Array.isArray(candidate.favoriteActionIds) ? candidate.favoriteActionIds : [],
    pinnedPackageIds: Array.isArray(candidate.pinnedPackageIds) ? candidate.pinnedPackageIds : [],
    layout: isRecord(candidate.layout) ? candidate.layout : {},
  };
}

function isRecord(value: unknown): value is Record<string, never> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
