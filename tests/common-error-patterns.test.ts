import { describe, expect, it } from 'vitest';
import {
  extractDiagnosticLocation,
  mapCommonErrorToDiagnostic,
} from '../src/shared/diagnostics/common-error-patterns';

describe('common error patterns', () => {
  it('maps TypeScript errors to actionable diagnostics', () => {
    const diagnostic = mapCommonErrorToDiagnostic(
      'src/index.ts:10:2 - error TS2307: Cannot find module zod',
    );

    expect(diagnostic?.source).toBe('typescript');
    expect(diagnostic?.location?.file).toBe('src/index.ts');
    expect(diagnostic?.suggestedActions.some((action) => action.kind === 'open-editor')).toBe(true);
  });

  it('extracts file locations', () => {
    expect(extractDiagnosticLocation('src/main.ts:3:9 error')?.line).toBe(3);
  });
});
