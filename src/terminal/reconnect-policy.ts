import type { TerminalSessionSnapshot } from '@/terminal/orchestrator';

export interface TerminalReconnectDecision {
  readonly shouldReconnect: boolean;
  readonly reason: 'running-session' | 'recent-crash' | 'idle-session' | 'already-finished' | 'too-old';
  readonly priority: number;
}

const RECENT_CRASH_WINDOW_MS = 30_000;
const STALE_SESSION_WINDOW_MS = 1000 * 60 * 60 * 8;

/**
 * Decides whether a terminal session should be restored after reload or WebSocket reconnect.
 *
 * @param session - Persisted terminal session snapshot.
 * @param nowMs - Current timestamp in milliseconds.
 * @returns A reconnect decision with an explicit reason and priority.
 *
 * @example
 * ```ts
 * const decision = decideTerminalReconnect(session, Date.now());
 * if (decision.shouldReconnect) restore(session.id);
 * ```
 */
export function decideTerminalReconnect(session: TerminalSessionSnapshot, nowMs = Date.now()): TerminalReconnectDecision {
  const lastActivityMs = Date.parse(session.lastActivityAtIso);
  const ageMs = Number.isFinite(lastActivityMs) ? nowMs - lastActivityMs : Number.POSITIVE_INFINITY;

  if (ageMs > STALE_SESSION_WINDOW_MS) return { shouldReconnect: false, reason: 'too-old', priority: 0 };
  if (session.status === 'running') return { shouldReconnect: true, reason: 'running-session', priority: 100 };
  if (session.status === 'crashed' && ageMs <= RECENT_CRASH_WINDOW_MS) return { shouldReconnect: true, reason: 'recent-crash', priority: 60 };
  if (session.status === 'idle') return { shouldReconnect: true, reason: 'idle-session', priority: 30 };
  return { shouldReconnect: false, reason: 'already-finished', priority: 0 };
}

/**
 * Ranks sessions by reconnect priority while discarding sessions that should stay closed.
 *
 * @param sessions - Persisted sessions from the orchestrator or history store.
 * @param nowMs - Current timestamp in milliseconds.
 * @returns Sessions paired with reconnect decisions.
 *
 * @example
 * ```ts
 * const queue = createReconnectQueue(orchestrator.list());
 * queue.map((item) => item.session.id);
 * ```
 */
export function createReconnectQueue(
  sessions: readonly TerminalSessionSnapshot[],
  nowMs = Date.now(),
): readonly { readonly session: TerminalSessionSnapshot; readonly decision: TerminalReconnectDecision }[] {
  return sessions
    .map((session) => ({ session, decision: decideTerminalReconnect(session, nowMs) }))
    .filter((item) => item.decision.shouldReconnect)
    .sort((left, right) => right.decision.priority - left.decision.priority || right.session.lastActivityAtIso.localeCompare(left.session.lastActivityAtIso));
}
