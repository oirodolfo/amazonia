import type { RuntimeStoreEvent } from '@/shared/runtime/workbench-runtime-store';
import type { TerminalSection } from '@/shared/terminal/terminal-section-folding';
import type { WorkspaceGraph } from '@/shared/workspace-graph/workspace-graph-types';

export interface RuntimeRunPersistenceRecord {
  readonly id: string;
  readonly command: string;
  readonly cwd: string;
  readonly status: 'created' | 'running' | 'exited' | 'failed' | 'killed';
  readonly startedAt: number;
  readonly finishedAt: number | null;
  readonly exitCode: number | null;
}

export interface RuntimeDiagnosticPersistenceRecord {
  readonly id: string;
  readonly runId: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
  readonly file: string | null;
  readonly line: number | null;
  readonly column: number | null;
  readonly createdAt: number;
}

export interface GraphSnapshotPersistenceRecord {
  readonly id: string;
  readonly workspaceId: string;
  readonly hash: string;
  readonly graph: WorkspaceGraph;
  readonly createdAt: number;
}

export interface RuntimePersistenceRepository {
  saveRun(record: RuntimeRunPersistenceRecord): void;
  saveEvent(runId: string, event: RuntimeStoreEvent): void;
  listEvents(runId: string): RuntimeStoreEvent[];
  saveDiagnostic(record: RuntimeDiagnosticPersistenceRecord): void;
  saveGraphSnapshot(record: GraphSnapshotPersistenceRecord): void;
  saveTerminalSection(sessionId: string, section: TerminalSection): void;
}
