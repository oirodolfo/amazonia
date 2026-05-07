import {
  createPinnedDiagnosticCommandState,
  pinDiagnosticCommand,
  unpinDiagnosticCommand,
  type PinnedDiagnosticCommandState,
} from '@/shared/diagnostics/pinned-diagnostic-commands';
import { createActionableDiagnostics } from '@/shared/diagnostics/actionable-diagnostics-engine';
import type {
  ActionableDiagnostic,
  DiagnosticSuggestedAction,
} from '@/shared/diagnostics/actionable-diagnostic-types';

export interface ActionableDiagnosticsViewModel {
  readonly diagnostics: readonly ActionableDiagnostic[];
  readonly pinned: PinnedDiagnosticCommandState;
}

/**
 * Creates actionable diagnostics view model from terminal lines.
 *
 * @param lines - Terminal output lines.
 * @returns Actionable diagnostics model.
 *
 * @example
 * ```ts
 * createActionableDiagnosticsViewModel(['error TS2307'])
 * ```
 */
export function createActionableDiagnosticsViewModel(
  lines: readonly string[],
): ActionableDiagnosticsViewModel {
  return {
    diagnostics: createActionableDiagnostics(lines),
    pinned: createPinnedDiagnosticCommandState(),
  };
}

/**
 * Pins a diagnostic command in the view model.
 *
 * @param model - Current model.
 * @param diagnostic - Diagnostic.
 * @param action - Suggested action.
 * @param now - Timestamp.
 * @returns Updated model.
 *
 * @example
 * ```ts
 * pinDiagnosticAction(model, diagnostic, action, Date.now())
 * ```
 */
export function pinDiagnosticAction(
  model: ActionableDiagnosticsViewModel,
  diagnostic: ActionableDiagnostic,
  action: DiagnosticSuggestedAction,
  now: number,
): ActionableDiagnosticsViewModel {
  return {
    ...model,
    pinned: pinDiagnosticCommand(model.pinned, diagnostic.id, action, now),
  };
}

/**
 * Removes a pinned command.
 *
 * @param model - Current model.
 * @param commandId - Pinned command id.
 * @returns Updated model.
 *
 * @example
 * ```ts
 * unpinDiagnosticAction(model, 'pinned:1')
 * ```
 */
export function unpinDiagnosticAction(
  model: ActionableDiagnosticsViewModel,
  commandId: string,
): ActionableDiagnosticsViewModel {
  return {
    ...model,
    pinned: unpinDiagnosticCommand(model.pinned, commandId),
  };
}
