import { describe, expect, it } from 'vitest';

import {
  parseSemanticTerminalLine,
  parseSemanticTerminalOutput,
  parseSemanticTerminalOutputLine,
} from './semantic-terminal-parser';

describe('semantic terminal parser', () => {
  it('parses pnpm errors with error code, package, URL and documentation links', () => {
    const result = parseSemanticTerminalOutputLine(
      'ERR_PNPM_FETCH_404 GET https://registry.npmjs.org/@cmdk%2Freact: Not Found - 404',
    );

    expect(result.tool).toBe('pnpm');
    expect(result.severity).toBe('error');
    expect(result.errorCodes).toContain('ERR_PNPM_FETCH_404');
    expect(result.documentationUrls).toContain('https://pnpm.io/errors');

    expect(result.tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'url',
          value: 'https://registry.npmjs.org/@cmdk%2Freact:',
        }),
        expect.objectContaining({
          type: 'errorCode',
          value: 'ERR_PNPM_FETCH_404',
          metadata: expect.objectContaining({
            documentationUrl: 'https://pnpm.io/errors',
          }),
        }),
      ]),
    );
  });

  it('parses TypeScript diagnostics with file location and TS error documentation', () => {
    const result = parseSemanticTerminalOutputLine(
      'src/index.ts:10:2 - error TS2307: Cannot find module "@/utils"',
    );

    expect(result.tool).toBe('typescript');
    expect(result.severity).toBe('error');
    expect(result.errorCodes).toContain('TS2307');
    expect(result.documentationUrls).toContain('https://typescript.tv/errors');

    expect(result.locations).toEqual([
      {
        filePath: 'src/index.ts',
        line: 10,
        column: 2,
      },
    ]);

    expect(result.tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'file',
          value: 'src/index.ts:10:2',
          location: {
            filePath: 'src/index.ts',
            line: 10,
            column: 2,
          },
        }),
        expect.objectContaining({
          type: 'errorCode',
          value: 'TS2307',
        }),
      ]),
    );
  });

  it('parses ESLint output with rule-like text and file location', () => {
    const result = parseSemanticTerminalOutputLine(
      'src/App.tsx:8:12 warning Unexpected any. eslint @typescript-eslint/no-explicit-any',
    );

    expect(result.tool).toBe('eslint');
    expect(result.severity).toBe('warning');
    expect(result.documentationUrls).toContain('https://eslint.org/docs/latest/');
    expect(result.locations).toEqual([
      {
        filePath: 'src/App.tsx',
        line: 8,
        column: 12,
      },
    ]);
  });

  it('parses Vite CSS PostCSS Tailwind errors', () => {
    const result = parseSemanticTerminalOutputLine(
      '[plugin:vite:css] [postcss] It looks like you are trying to use tailwindcss directly as a PostCSS plugin.',
    );

    expect(result.tool).toBe('vite');
    expect(result.severity).toBe('error');

    expect(result.documentationUrls).toEqual(
      expect.arrayContaining([
        'https://vite.dev/guide/',
      ]),
    );
  });

  it('parses Node runtime errors and documentation URL', () => {
    const result = parseSemanticTerminalOutputLine(
      'Error: listen EADDRINUSE: address already in use 127.0.0.1:5173',
    );

    expect(result.tool).toBe('node');
    expect(result.severity).toBe('error');
    expect(result.errorCodes).toContain('EADDRINUSE');
    expect(result.documentationUrls).toContain('https://nodejs.org/api/errors.html');

    expect(result.tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'port',
          value: '5173',
          metadata: {
            port: 5173,
          },
        }),
      ]),
    );
  });

  it('parses Prisma error codes', () => {
    const result = parseSemanticTerminalOutputLine(
      'PrismaClientInitializationError: P1001 Cannot reach database server at localhost:5432',
    );

    expect(result.tool).toBe('prisma');
    expect(result.severity).toBe('error');
    expect(result.errorCodes).toContain('P1001');
    expect(result.documentationUrls).toContain('https://www.prisma.io/docs');
    expect(result.documentationUrls).toContain('https://www.prisma.io/docs/orm/reference/error-reference');

    expect(result.tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'port',
          value: '5432',
        }),
      ]),
    );
  });

  it('parses shell commands', () => {
    const result = parseSemanticTerminalOutputLine('❯ pnpm install --no-frozen-lockfile');

    expect(result.tool).toBe('pnpm');
    expect(result.tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'command',
          value: 'pnpm install --no-frozen-lockfile',
          tool: 'pnpm',
        }),
      ]),
    );
  });

  it('parses package names from package-manager messages', () => {
    const result = parseSemanticTerminalOutputLine(
      'This error happened while installing a direct dependency of @xterm/xterm and tailwindcss',
    );

    expect(result.tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'package',
          value: '@xterm/xterm',
        }),
        expect.objectContaining({
          type: 'package',
          value: 'tailwindcss',
        }),
      ]),
    );
  });

  it('parses duration and version tokens', () => {
    const result = parseSemanticTerminalOutputLine(
      'vite v8.0.11 ready in 320ms',
    );

    expect(result.tool).toBe('vite');
    expect(result.severity).toBe('success');

    expect(result.tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'version',
          value: '8.0.11',
        }),
        expect.objectContaining({
          type: 'duration',
          value: '320ms',
        }),
      ]),
    );
  });

  it('returns a plain token when no semantic token is detected', () => {
    const result = parseSemanticTerminalOutputLine('just a normal log line');

    expect(result.tool).toBe('unknown');
    expect(result.severity).toBeNull();
    expect(result.tokens).toEqual([
      {
        type: 'plain',
        value: 'just a normal log line',
        tool: 'unknown',
        severity: undefined,
      },
    ]);
  });

  it('keeps backward-compatible token-only parsing', () => {
    const tokens = parseSemanticTerminalLine(
      'src/main.ts:1:1 error TS1005: expected semicolon',
    );

    expect(tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'file',
          value: 'src/main.ts:1:1',
        }),
        expect.objectContaining({
          type: 'errorCode',
          value: 'TS1005',
        }),
      ]),
    );
  });

  it('parses multi-line terminal output', () => {
    const result = parseSemanticTerminalOutput([
      '❯ pnpm install',
      'ERR_PNPM_FETCH_404 GET https://registry.npmjs.org/@cmdk%2Freact',
      'src/index.ts:10:2 error TS2307 Cannot find module',
    ].join('\n'));

    expect(result).toHaveLength(3);
    expect(result[0]?.tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'command',
          value: 'pnpm install',
        }),
      ]),
    );
    expect(result[1]?.errorCodes).toContain('ERR_PNPM_FETCH_404');
    expect(result[2]?.errorCodes).toContain('TS2307');
  });

  it('deduplicates repeated error codes', () => {
    const result = parseSemanticTerminalOutputLine(
      'TS2307 TS2307 error TS2307 Cannot find module',
    );

    const errorCodeTokens = result.tokens.filter((token) => token.type === 'errorCode');

    expect(errorCodeTokens).toHaveLength(1);
    expect(errorCodeTokens[0]?.value).toBe('TS2307');
  });
});