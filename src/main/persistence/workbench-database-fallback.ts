import type {LayoutState, RunRecord} from '@/shared/types';
import {DEFAULT_LAYOUT} from '@/shared/protocol';

export interface FallbackWorkbenchDatabase {
    readLayout(): LayoutState;
    writeLayout(layout: LayoutState): void;
    recordRun(run: RunRecord): void;
    incrementActionWeight(actionId: string): void;
    readActionWeights(): Readonly<Record<string, number>>;
}

export function createFallbackWorkbenchDatabase(): FallbackWorkbenchDatabase {
    let layout: LayoutState = DEFAULT_LAYOUT;
    const actionWeights = new Map<string, number>();

    return {
        readLayout() {
            return layout;
        },
        writeLayout(nextLayout) {
            layout = nextLayout;
        },
        recordRun(_run) {
            // Intentionally no-op for fallback database.
        },
        incrementActionWeight(actionId) {
            actionWeights.set(actionId, (actionWeights.get(actionId) ?? 0) + 1);
        },
        readActionWeights() {
            return Object.fromEntries(actionWeights.entries());
        },
    };
}

