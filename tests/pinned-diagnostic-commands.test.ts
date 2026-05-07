import { describe, expect, it } from 'vitest';
import {
  createPinnedDiagnosticCommandState,
  pinDiagnosticCommand,
  unpinDiagnosticCommand,
} from '../src/shared/diagnostics/pinned-diagnostic-commands';

describe('pinned diagnostic commands', () => {
  it('pins and unpins command suggestions', () => {
    const pinned = pinDiagnosticCommand(
      createPinnedDiagnosticCommandState(),
      'diagnostic',
      {
        id: 'fix',
        kind: 'pin-command',
        label: 'Run fix',
        command: 'pnpm install',
        description: 'Install deps',
      },
      1,
    );

    expect(pinned.commands).toHaveLength(1);
    expect(unpinDiagnosticCommand(pinned, pinned.commands[0]!.id).commands).toHaveLength(0);
  });
});
