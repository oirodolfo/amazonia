import { describe, expect, it } from 'vitest';
import { createEditorCommandPlan, parseEditorTarget } from '../src/editor/editor-target';

describe('editor target helpers', () => {
  it('parses file line and column references', () => {
    const target = parseEditorTarget('src/main.ts:12:4');
    expect(target?.path).toBe('src/main.ts');
    expect(target?.line).toBe(12);
    expect(target?.column).toBe(4);
  });

  it('creates cursor command plans', () => {
    const plan = createEditorCommandPlan({ path: 'src/main.ts', line: 3 }, 'cursor');
    expect(plan.command).toBe('cursor');
    expect(plan.args).toContain('src/main.ts:3:1');
  });
});
