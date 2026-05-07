import type {
  ActionableDiagnostic,
  DiagnosticLocation,
  DiagnosticSourceKind,
  DiagnosticSuggestedAction,
} from './actionable-diagnostic-types';

interface ErrorPattern {
  readonly id: string;
  readonly source: DiagnosticSourceKind;
  readonly test: RegExp;
  readonly title: string;
  readonly severity: ActionableDiagnostic['severity'];
  readonly createActions: (raw: string, location: DiagnosticLocation | null) => readonly DiagnosticSuggestedAction[];
}

const TYPESCRIPT_CODE_PATTERN = /TS\d{4}/u;
const MODULE_NOT_FOUND_PATTERN = /(Cannot find module|ERR_MODULE_NOT_FOUND|MODULE_NOT_FOUND)/iu;
const COMMAND_NOT_FOUND_PATTERN = /(command not found|not recognized as an internal or external command)/iu;
const NPM_MISSING_SCRIPT_PATTERN = /(Missing script|Command "[^"]+" not found|ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL)/iu;
const PERMISSION_PATTERN = /(EACCES|permission denied)/iu;
const PORT_IN_USE_PATTERN = /(EADDRINUSE|address already in use)/iu;

const PATTERNS: readonly ErrorPattern[] = [
  {
    id: 'typescript:compiler-error',
    source: 'typescript',
    test: TYPESCRIPT_CODE_PATTERN,
    title: 'TypeScript compiler error',
    severity: 'error',
    createActions: (_raw, location) => [
      openEditorAction(location),
      {
        id: 'tsc:no-emit',
        kind: 'pin-command',
        label: 'Pin typecheck command',
        command: 'pnpm exec tsc --noEmit',
        description: 'Runs TypeScript type checking without writing output files.',
      },
    ],
  },
  {
    id: 'node:module-not-found',
    source: 'node',
    test: MODULE_NOT_FOUND_PATTERN,
    title: 'Node module resolution error',
    severity: 'error',
    createActions: (_raw, location) => [
      openEditorAction(location),
      {
        id: 'install:deps',
        kind: 'pin-command',
        label: 'Pin install command',
        command: 'pnpm install',
        description: 'Refreshes dependencies and lockfile links.',
      },
      {
        id: 'why:module',
        kind: 'copy-command',
        label: 'Copy dependency inspection command',
        command: 'pnpm why <package>',
        description: 'Use this after replacing <package> with the missing dependency.',
      },
    ],
  },
  {
    id: 'shell:command-not-found',
    source: 'shell',
    test: COMMAND_NOT_FOUND_PATTERN,
    title: 'Shell command not found',
    severity: 'error',
    createActions: () => [
      {
        id: 'shell:path',
        kind: 'copy-command',
        label: 'Copy PATH debug command',
        command: 'echo $PATH && which <command>',
        description: 'Helps verify whether the executable exists in PATH.',
      },
    ],
  },
  {
    id: 'package:missing-script',
    source: 'npm',
    test: NPM_MISSING_SCRIPT_PATTERN,
    title: 'Package script not found',
    severity: 'error',
    createActions: () => [
      {
        id: 'scripts:list',
        kind: 'pin-command',
        label: 'Pin scripts list command',
        command: 'pnpm run',
        description: 'Lists available scripts in the current package.',
      },
    ],
  },
  {
    id: 'node:permission',
    source: 'node',
    test: PERMISSION_PATTERN,
    title: 'Permission denied',
    severity: 'error',
    createActions: () => [
      {
        id: 'permission:fix',
        kind: 'copy-command',
        label: 'Copy permission debug command',
        command: 'ls -la <path>',
        description: 'Inspect permissions before changing them.',
      },
    ],
  },
  {
    id: 'node:port-in-use',
    source: 'node',
    test: PORT_IN_USE_PATTERN,
    title: 'Port already in use',
    severity: 'error',
    createActions: () => [
      {
        id: 'port:list',
        kind: 'pin-command',
        label: 'Pin port inspection command',
        command: 'lsof -i :<port>',
        description: 'Finds the process using a port on macOS/Linux.',
      },
      {
        id: 'port:list-windows',
        kind: 'copy-command',
        label: 'Copy Windows port inspection command',
        command: 'netstat -ano | findstr :<port>',
        description: 'Finds the process using a port on Windows.',
      },
    ],
  },
];

/**
 * Maps terminal output to actionable diagnostics for Node, TypeScript, npm/pnpm and shell errors.
 *
 * @param raw - Raw output line or block.
 * @returns Actionable diagnostic or null.
 *
 * @example
 * ```ts
 * mapCommonErrorToDiagnostic('src/index.ts:10:2 - error TS2307: Cannot find module')
 * ```
 */
export function mapCommonErrorToDiagnostic(raw: string): ActionableDiagnostic | null {
  const pattern = PATTERNS.find((candidate) => candidate.test.test(raw));

  if (!pattern) {
    return null;
  }

  const location = extractDiagnosticLocation(raw);

  return {
    id: `diagnostic:${pattern.id}:${stableHash(raw)}`,
    source: pattern.source,
    severity: pattern.severity,
    title: pattern.title,
    message: simplifyMessage(raw),
    raw,
    location,
    suggestedActions: pattern.createActions(raw, location),
  };
}

/**
 * Extracts file, line and column from common TypeScript/Node stack formats.
 *
 * @param raw - Raw diagnostic text.
 * @returns Diagnostic location or null.
 *
 * @example
 * ```ts
 * extractDiagnosticLocation('src/index.ts:10:2 error')
 * ```
 */
export function extractDiagnosticLocation(raw: string): DiagnosticLocation | null {
  const match = raw.match(/((?:[A-Za-z]:)?[^\s()]+\.(?:ts|tsx|js|jsx|mjs|cjs|json|css|scss|md)):(\d+)(?::(\d+))?/u);

  if (!match) {
    return null;
  }

  return {
    file: match[1]!,
    line: Number(match[2]),
    column: match[3] ? Number(match[3]) : null,
  };
}

function openEditorAction(location: DiagnosticLocation | null): DiagnosticSuggestedAction {
  return {
    id: 'open:editor',
    kind: 'open-editor',
    label: location ? 'Open in editor' : 'Open related file',
    command: null,
    description: location
      ? `Opens ${location.file}${location.line ? `:${location.line}` : ''} in the default editor.`
      : 'Opens the related file when a location is available.',
  };
}

function simplifyMessage(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').slice(0, 500);
}

function stableHash(input: string): string {
  let hash = 0;

  for (const char of input) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash.toString(16);
}
