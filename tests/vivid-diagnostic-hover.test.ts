import { describe, expect, it } from 'vitest';
import { createVividDiagnosticHover } from '../src/shared/diagnostics/vivid-diagnostic-hover';

describe('createVividDiagnosticHover', () => {
  it('extracts file location and actions', () => {
    const hover = createVividDiagnosticHover({
      id: 'd1',
      message: 'src/index.ts:10:2 error boom',
      severity: 'error',
    });

    expect(hover.file).toBe('src/index.ts');
    expect(hover.line).toBe(10);
    expect(hover.actions.map((action) => action.id)).toContain('open-in-editor');
  });
});
