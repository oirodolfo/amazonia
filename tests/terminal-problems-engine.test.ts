import { describe, expect, it } from 'vitest';
import { createTerminalProblems } from '../src/shared/terminal/terminal-problems-engine';

describe('terminal problems engine', () => {
  it('creates problems from semantic markers', () => {
    const problems = createTerminalProblems([
      { id: 'error:1', type: 'error', value: 'Error: boom', line: 1 },
    ]);

    expect(problems).toHaveLength(1);
    expect(problems[0]?.severity).toBe('error');
  });
});
