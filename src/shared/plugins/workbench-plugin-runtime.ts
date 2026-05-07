export interface WorkbenchPluginContext {
    emit(event: string, payload: unknown): void;
}

export interface WorkbenchPlugin {
    readonly id: string;

    setup(context: WorkbenchPluginContext): void;
}

export interface WorkbenchPluginRuntime {
    register(plugin: WorkbenchPlugin): void;

    list(): readonly WorkbenchPlugin[];
}

/**
 * Creates the plugin runtime registry.
 *
 * @returns Plugin runtime.
 *
 * @example
 * ```ts
 * const runtime = createWorkbenchPluginRuntime()
 * ```
 */
export function createWorkbenchPluginRuntime(): WorkbenchPluginRuntime {
    const plugins: WorkbenchPlugin[] = [];

    return {
        register(plugin) {
            plugins.push(plugin);
        },

        list() {
            return plugins;
        },
    };
}
