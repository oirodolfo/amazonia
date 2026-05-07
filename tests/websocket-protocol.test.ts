import { describe, expect, it } from 'vitest';
import { validateClientMessage } from '../src/runtime';

describe('websocket protocol', () => {
  it('accepts ping messages with request ids', () => {
    expect(validateClientMessage({ type: 'ping', requestId: 'one' }).valid).toBe(true);
  });

  it('rejects malformed terminal spawn messages', () => {
    expect(validateClientMessage({ type: 'terminal:spawn', requestId: 'one' }).valid).toBe(false);
  });
});
