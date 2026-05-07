export type AnalyticsEventName = 'workspace.opened' | 'action.started' | 'action.finished' | 'layout.changed' | 'command_palette.used';

export interface AnalyticsEvent {
  readonly name: AnalyticsEventName;
  readonly payload: Readonly<Record<string, string | number | boolean | null>>;
  readonly createdAtIso: string;
}

export interface AnalyticsSink {
  track(event: AnalyticsEvent): void;
  list(): readonly AnalyticsEvent[];
}

export class MemoryAnalyticsSink implements AnalyticsSink {
  private readonly events: AnalyticsEvent[] = [];

  /**
   * Stores one local analytics event without sending anything outside the machine.
   *
   * @param event - Event metadata to keep in local history.
   * @returns Nothing.
   *
   * @example
   * ```ts
   * sink.track({ name: 'action.started', payload: { actionId: 'build' }, createdAtIso: new Date().toISOString() });
   * ```
   */
  track(event: AnalyticsEvent): void {
    this.events.push(event);
  }

  /**
   * Returns a snapshot of captured local analytics events.
   *
   * @returns Immutable event list.
   *
   * @example
   * ```ts
   * const count = sink.list().length;
   * ```
   */
  list(): readonly AnalyticsEvent[] {
    return [...this.events];
  }
}

/**
 * Creates a timestamped local analytics event.
 *
 * @param name - Semantic event name.
 * @param payload - Small local-only payload.
 * @returns A normalized analytics event.
 *
 * @example
 * ```ts
 * createAnalyticsEvent('workspace.opened', { packageCount: 3 });
 * ```
 */
export function createAnalyticsEvent(
  name: AnalyticsEventName,
  payload: Readonly<Record<string, string | number | boolean | null>> = {},
): AnalyticsEvent {
  return { name, payload, createdAtIso: new Date().toISOString() };
}
