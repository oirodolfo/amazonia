import { describe, expect, it } from 'vitest';
import type { UseXTermProps } from '../src/renderer/terminal/use-xterm';

describe('useXTerm types', () => {
  it('accepts listener props', () => {
    const props: UseXTermProps = {
      listeners: {
        onData: (data) => data.toUpperCase(),
        onResize: (event) => event.cols + event.rows,
      },
    };

    expect(Boolean(props.listeners?.onData)).toBe(true);
  });
});
