export type WorkbenchRuntime = 'electron' | 'web';

export type TerminalRunStatus =
  | 'created'
  | 'connecting'
  | 'running'
  | 'exited'
  | 'failed'
  | 'killed';

export interface TerminalSize {
  readonly cols: number;
  readonly rows: number;
}

export interface CreateTerminalSessionInput {
  readonly title: string;
  readonly cwd: string;
  readonly command?: string | null;
  readonly runtime: WorkbenchRuntime;
  readonly size?: TerminalSize;
}

export interface TerminalSessionSnapshot {
  readonly id: string;
  readonly title: string;
  readonly cwd: string;
  readonly command: string | null;
  readonly runtime: WorkbenchRuntime;
  readonly status: TerminalRunStatus;
  readonly size: TerminalSize;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly exitCode: number | null;
}

export interface RunActionInput {
  readonly actionId: string;
  readonly title: string;
  readonly command: string;
  readonly cwd: string;
  readonly runtime: WorkbenchRuntime;
  readonly size?: TerminalSize;
}

export interface TerminalDataFrame {
  readonly sessionId: string;
  readonly data: string;
  readonly receivedAt: number;
}

export type WorkbenchClientMessage =
  | { readonly type: 'terminal.create'; readonly payload: CreateTerminalSessionInput }
  | { readonly type: 'terminal.runAction'; readonly payload: RunActionInput }
  | { readonly type: 'terminal.input'; readonly payload: { readonly sessionId: string; readonly data: string } }
  | { readonly type: 'terminal.resize'; readonly payload: { readonly sessionId: string; readonly size: TerminalSize } }
  | { readonly type: 'terminal.kill'; readonly payload: { readonly sessionId: string } }
  | { readonly type: 'workspace.scan'; readonly payload: { readonly root: string } };

export type WorkbenchServerMessage =
  | { readonly type: 'terminal.created'; readonly payload: TerminalSessionSnapshot }
  | { readonly type: 'terminal.data'; readonly payload: TerminalDataFrame }
  | { readonly type: 'terminal.status'; readonly payload: TerminalSessionSnapshot }
  | { readonly type: 'terminal.exit'; readonly payload: TerminalSessionSnapshot }
  | { readonly type: 'workspace.scanned'; readonly payload: unknown }
  | { readonly type: 'error'; readonly payload: { readonly message: string; readonly cause?: string } };

const DEFAULT_TERMINAL_SIZE: TerminalSize = {
  cols: 120,
  rows: 32,
};

/**
 * Creates a normalized terminal session snapshot.
 *
 * @param input - Session creation input.
 * @returns Runtime-neutral terminal snapshot.
 *
 * @example
 * ```ts
 * createTerminalSessionSnapshot({ title: 'dev', cwd: process.cwd(), runtime: 'electron' })
 * ```
 */
export function createTerminalSessionSnapshot(
  input: CreateTerminalSessionInput,
): TerminalSessionSnapshot {
  const now = Date.now();

  return {
    id: `term_${now}_${Math.random().toString(36).slice(2)}`,
    title: input.title,
    cwd: input.cwd,
    command: input.command ?? null,
    runtime: input.runtime,
    status: 'created',
    size: input.size ?? DEFAULT_TERMINAL_SIZE,
    createdAt: now,
    updatedAt: now,
    exitCode: null,
  };
}

/**
 * Updates a terminal snapshot without mutating the previous object.
 *
 * @param snapshot - Current terminal state.
 * @param patch - Partial state changes.
 * @returns Updated terminal snapshot.
 *
 * @example
 * ```ts
 * updateTerminalSession(snapshot, { status: 'running' })
 * ```
 */
export function updateTerminalSession(
  snapshot: TerminalSessionSnapshot,
  patch: Partial<Omit<TerminalSessionSnapshot, 'id' | 'createdAt'>>,
): TerminalSessionSnapshot {
  return {
    ...snapshot,
    ...patch,
    updatedAt: Date.now(),
  };
}
