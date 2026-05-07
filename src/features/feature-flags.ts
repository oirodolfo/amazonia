export type FeatureFlagKey =
    | 'desktopRuntime'
    | 'webRuntime'
    | 'terminalTabs'
    | 'terminalOrchestrator'
    | 'terminalRestore'
    | 'friendlyOutput'
    | 'friendlyOutputToolParsers'
    | 'commandPalette'
    | 'workspaceScanner'
    | 'actionGraph'
    | 'turboActions'
    | 'nxActions'
    | 'persistedLayout'
    | 'persistedTerminalTabs'
    | 'localAnalytics'
    | 'clickableTerminalLinks'
    | 'editorIntegration'
    | 'devtoolsTimeline';

export type FeatureFlags = Readonly<Record<FeatureFlagKey, boolean>>;

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
    desktopRuntime: true,
    webRuntime: true,
    terminalTabs: true,
    terminalOrchestrator: true,
    terminalRestore: true,
    friendlyOutput: true,
    friendlyOutputToolParsers: true,
    commandPalette: true,
    workspaceScanner: true,
    actionGraph: true,
    turboActions: true,
    nxActions: true,
    persistedLayout: true,
    persistedTerminalTabs: true,
    localAnalytics: true,
    clickableTerminalLinks: true,
    editorIntegration: true,
    devtoolsTimeline: true,
};

/**
 * Merges persisted feature flags with defaults so new releases stay enabled safely.
 *
 * @param overrides - Optional partial flags loaded from storage or tests.
 * @returns A complete immutable feature flag map.
 *
 * @example
 * ```ts
 * const flags = createFeatureFlags({ nxActions: false });
 * flags.nxActions // false
 * flags.actionGraph // true
 * ```
 */
export function createFeatureFlags(overrides: Partial<FeatureFlags> = {}): FeatureFlags {
    return Object.freeze({...DEFAULT_FEATURE_FLAGS, ...overrides});
}
