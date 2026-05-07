export type WorkbenchRuntimeKind = 'electron' | 'web';

export interface RuntimeCapabilities {
  readonly kind: WorkbenchRuntimeKind;
  readonly supportsNativePty: boolean;
  readonly supportsNativeFileOpen: boolean;
  readonly transport: 'ipc' | 'websocket';
}

/**
 * Resolves runtime capabilities from the current environment.
 *
 * @remarks
 * This replaces scattered `window.curupiraWorkbench` checks with a tiny capability object. Keeping the branch here
 * makes renderer code easier to test and keeps the Electron/Web split boring on purpose.
 *
 * @param hasElectronBridge - Whether the secure preload bridge is available.
 * @returns A normalized runtime capability descriptor.
 *
 * @example
 * ```ts
 * resolveRuntimeCapabilities(true).transport;
 * // => 'ipc'
 * ```
 */
export function resolveRuntimeCapabilities(hasElectronBridge: boolean): RuntimeCapabilities {
  if (hasElectronBridge) {
    return { kind: 'electron', supportsNativePty: true, supportsNativeFileOpen: true, transport: 'ipc' };
  }

  return { kind: 'web', supportsNativePty: false, supportsNativeFileOpen: false, transport: 'websocket' };
}
