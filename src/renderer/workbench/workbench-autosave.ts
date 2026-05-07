import type {WorkbenchRuntimeApp} from './workbench-runtime-app';

export interface WorkbenchAutosaveController {
    schedule(): void;

    flush(): Promise<void>;

    dispose(): void;
}

/**
 * Creates a debounced autosave controller for the renderer workbench state.
 *
 * @param app - Runtime app.
 * @param delayMs - Debounce delay.
 * @returns Autosave controller.
 *
 * @example
 * ```ts
 * const autosave = createWorkbenchAutosave(app)
 * autosave.schedule()
 * ```
 */
export function createWorkbenchAutosave(
    app: Pick<WorkbenchRuntimeApp, 'persist'>,
    delayMs = 250,
): WorkbenchAutosaveController {
    let timer: ReturnType<typeof setTimeout> | null = null;

    return {
        schedule() {
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(() => {
                timer = null;
                void app.persist();
            }, delayMs);
        },

        async flush() {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }

            await app.persist();
        },

        dispose() {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        },
    };
}
