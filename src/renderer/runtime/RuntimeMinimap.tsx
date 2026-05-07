import type { RuntimeDiagnosticMarker } from '@/shared/runtime/runtime-intelligence-types';

export interface RuntimeMinimapProps {
  readonly diagnostics: readonly RuntimeDiagnosticMarker[];
}

/**
 * Renders semantic runtime markers in a minimap-style visualization.
 *
 * @param props - Runtime minimap props.
 * @returns Runtime minimap.
 *
 * @example
 * ```tsx
 * <RuntimeMinimap diagnostics={diagnostics} />
 * ```
 */
export function RuntimeMinimap(props: RuntimeMinimapProps): React.Element {
  return (
    <div className="flex h-full w-5 flex-col items-center gap-[2px] rounded-full bg-black/30 p-1">
      {props.diagnostics.slice(0, 120).map((diagnostic) => (
        <div
          key={diagnostic.id}
          className={
            diagnostic.severity === 'error'
              ? 'h-4 w-1 rounded-full bg-red-400'
              : diagnostic.severity === 'warning'
                ? 'h-3 w-1 rounded-full bg-amber-300'
                : 'h-2 w-1 rounded-full bg-cyan-300'
          }
          title={diagnostic.message}
        />
      ))}
    </div>
  );
}
