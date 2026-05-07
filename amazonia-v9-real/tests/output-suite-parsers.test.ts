import { describe, expect, it } from 'vitest';
import { detectOutputTool, parseToolOutput } from '../src/output/suite-parsers';

describe('suite output parsers', () => {
  it('detects TypeScript diagnostics', () => {
    const raw = 'src/index.ts:10:2 - error TS2322: Type string is not assignable';
    expect(detectOutputTool(raw)).toBe('typescript');
    expect(parseToolOutput(raw).diagnostics[0]?.level).toBe('error');
  });

  it('detects Vitest output', () => {
    expect(detectOutputTool('Vitest failed tests')).toBe('vitest');
  });
});
