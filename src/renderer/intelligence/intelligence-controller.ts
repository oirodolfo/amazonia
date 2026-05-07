import type {WorkbenchState} from '@/renderer/workbench/workbench-state';
import {createIntelligenceViewModel} from './intelligence-view-model';

export interface IntelligenceControllerResult {
    readonly rankedActionIds: readonly string[];
    readonly topSuggestionIds: readonly string[];
}

/**
 * Creates an intelligence controller result from the current workbench state.
 *
 * @param state - Workbench state.
 * @param currentCwd - Current runtime cwd.
 * @returns Ranked ids and top suggestions for cheap UI comparisons.
 *
 * @example
 * ```ts
 * createIntelligenceControllerResult(state, process.cwd())
 * ```
 */
export function createIntelligenceControllerResult(
    state: WorkbenchState,
    currentCwd: string,
): IntelligenceControllerResult {
    const model = createIntelligenceViewModel({
        actions: state.actions,
        store: state.store,
        currentCwd,
        currentPackageId: state.sidebar.selectedPackageId,
        query: state.sidebar.query,
    });

    return {
        rankedActionIds: model.rankedActions.map((item) => item.action.id),
        topSuggestionIds: model.suggestions.map((item) => item.actionId),
    };
}
