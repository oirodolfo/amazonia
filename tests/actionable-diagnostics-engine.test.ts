import { describe, expect, it } from 'vitest';
import { createActionableDiagnostics } from '../src/shared/diagnostics/actionable-diagnostics-engine';

describe('actionable diagnostics engine', () => {
  it('deduplicates diagnostics', () => {
    const diagnostics = createActionableDiagnostics([
      'src/index.ts:10:2 error TS2307',
      'src/index.ts:10:2 error TS2307',
    ]);

    expect(diagnostics).toHaveLength(1);
  });
});
