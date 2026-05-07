import type { DiagnosticSuggestedAction, PinnedDiagnosticCommand } from './actionable-diagnostic-types';

export interface PinnedDiagnosticCommandState {
  readonly commands: readonly PinnedDiagnosticCommand[];
}

/**
 * Creates the initial pinned diagnostic command state.
 *
 * @returns Empty pinned command state.
 *
 * @example
 * ```ts
 * createPinnedDiagnosticCommandState()
 * ```
 */
export function createPinnedDiagnosticCommandState(): PinnedDiagnosticCommandState {
  return {
    commands: [],
  };
}

/**
 * Pins a suggested command so it can be re-run later.
 *
 * @param state - Current pinned command state.
 * @param diagnosticId - Diagnostic id.
 * @param action - Suggested action to pin.
 * @param now - Current timestamp.
 * @returns Updated state.
 *
 * @example
 * ```ts
 * pinDiagnosticCommand(state, 'diag', action, Date.now())
 * ```
 */
export function pinDiagnosticCommand(
  state: PinnedDiagnosticCommandState,
  diagnosticId: string,
  action: DiagnosticSuggestedAction,
  now: number,
): PinnedDiagnosticCommandState {
  if (!action.command) {
    return state;
  }

  const next: PinnedDiagnosticCommand = {
    id: `pinned:${diagnosticId}:${action.id}`,
    diagnosticId,
    command: action.command,
    label: action.label,
    createdAt: now,
  };

  return {
    commands: [
      next,
      ...state.commands.filter((command) => command.id !== next.id),
    ].slice(0, 50),
  };
}

/**
 * Removes a pinned diagnostic command.
 *
 * @param state - Current pinned command state.
 * @param commandId - Command id to remove.
 * @returns Updated state.
 *
 * @example
 * ```ts
 * unpinDiagnosticCommand(state, 'pinned:id')
 * ```
 */
export function unpinDiagnosticCommand(
  state: PinnedDiagnosticCommandState,
  commandId: string,
): PinnedDiagnosticCommandState {
  return {
    commands: state.commands.filter((command) => command.id !== commandId),
  };
}
