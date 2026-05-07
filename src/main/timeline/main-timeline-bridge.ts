import type { WorkbenchRepository } from '@/main/persistence/workbench-repository';
import type { TerminalDataFrame, TerminalSessionSnapshot } from '@/shared/runtime/runtime-types';
import { createRunTimelineEvent, type RunTimelineEvent } from '@/shared/timeline/run-timeline';

export interface MainTimelineBridge {
  readonly events: readonly RunTimelineEvent[];
  onTerminalData(frame: TerminalDataFrame): void;
  onTerminalStatus(snapshot: TerminalSessionSnapshot): void;
  onTerminalExit(snapshot: TerminalSessionSnapshot): void;
}

/**
 * Creates the main-process timeline bridge.
 *
 * @param repository - Workbench repository for future durable timeline storage.
 * @returns Timeline bridge instance.
 *
 * @example
 * ```ts
 * const bridge = createMainTimelineBridge(repository)
 * ```
 */
export function createMainTimelineBridge(repository: WorkbenchRepository): MainTimelineBridge {
  const events: RunTimelineEvent[] = [];

  return {
    get events() {
      return events;
    },

    onTerminalData(frame) {
      const lower = frame.data.toLowerCase();

      if (lower.includes('error')) {
        events.push(createRunTimelineEvent({
          runId: frame.sessionId,
          type: 'output-error',
          label: 'Output error detected',
          metadata: { sample: frame.data.slice(0, 500) },
        }));
        return;
      }

      if (lower.includes('warn')) {
        events.push(createRunTimelineEvent({
          runId: frame.sessionId,
          type: 'output-warning',
          label: 'Output warning detected',
          metadata: { sample: frame.data.slice(0, 500) },
        }));
      }
    },

    onTerminalStatus(snapshot) {
      events.push(createRunTimelineEvent({
        runId: snapshot.id,
        type: snapshot.status === 'running' ? 'command-started' : 'terminal-created',
        label: `Terminal ${snapshot.status}`,
        metadata: {
          title: snapshot.title,
          cwd: snapshot.cwd,
          command: snapshot.command,
        },
      }));

      repository.saveTerminalSession(snapshot);
    },

    onTerminalExit(snapshot) {
      events.push(createRunTimelineEvent({
        runId: snapshot.id,
        type: 'command-finished',
        label: `Command finished with ${snapshot.exitCode ?? 'unknown'}`,
        metadata: {
          title: snapshot.title,
          command: snapshot.command,
          exitCode: snapshot.exitCode,
        },
      }));

      repository.saveTerminalSession(snapshot);
    },
  };
}
