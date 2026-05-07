export type WorkbenchFeatureFlag =
    | 'enableTerminal'
    | 'enableWebSocketTerminal'
    | 'enableElectronTerminal'
    | 'enableCommandPalette'
    | 'enableFriendlyOutput'
    | 'enableTimeline'
    | 'enableActionGraph'
    | 'enableSQLitePersistence'
    | 'enableLayoutRestore'
    | 'enableActionFrequency';

export type FeatureFlagMap = Readonly<Record<WorkbenchFeatureFlag, boolean>>;

export const defaultFeatureFlags: FeatureFlagMap = {
    enableTerminal: true,
    enableWebSocketTerminal: true,
    enableElectronTerminal: true,
    enableCommandPalette: true,
    enableFriendlyOutput: true,
    enableTimeline: true,
    enableActionGraph: true,
    enableSQLitePersistence: true,
    enableLayoutRestore: true,
    enableActionFrequency: true,
};

/**
 * Checks whether a workbench feature flag is enabled.
 *
 * @param flags - Feature flag map.
 * @param flag - Flag to inspect.
 * @returns Whether the feature is enabled.
 *
 * @example
 * ```ts
 * isFeatureEnabled(defaultFeatureFlags, 'enableTimeline')
 * // true
 * ```
 */
export function isFeatureEnabled(flags: FeatureFlagMap, flag: WorkbenchFeatureFlag): boolean {
    return flags[flag] === true;
}

/**
 * Creates feature flags by merging overrides over defaults.
 *
 * @param overrides - Partial feature flag overrides.
 * @returns Complete feature flag map.
 *
 * @example
 * ```ts
 * createFeatureFlags({ enableActionGraph: false })
 * ```
 */
export function createFeatureFlags(overrides: Partial<FeatureFlagMap> = {}): FeatureFlagMap {
    return {
        ...defaultFeatureFlags,
        ...overrides,
    };
}
