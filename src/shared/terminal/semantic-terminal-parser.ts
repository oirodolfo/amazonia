/* -------------------------------------------------------------------------- */
/* Semantic terminal parser                                                   */
/* -------------------------------------------------------------------------- */

export type SemanticTerminalSeverity = 'error' | 'warning' | 'info' | 'success' | 'debug';

export type SemanticTerminalTool =
  | 'typescript'
  | 'eslint'
  | 'prettier'
  | 'vite'
  | 'vitest'
  | 'jest'
  | 'tsup'
  | 'rollup'
  | 'webpack'
  | 'babel'
  | 'node'
  | 'pnpm'
  | 'npm'
  | 'yarn'
  | 'bun'
  | 'turbo'
  | 'git'
  | 'docker'
  | 'prisma'
  | 'nestjs'
  | 'electron'
  | 'tailwindcss'
  | 'postcss'
  | 'unknown';

export type SemanticTerminalTokenType =
  | 'severity'
  | 'tool'
  | 'errorCode'
  | 'url'
  | 'documentationUrl'
  | 'file'
  | 'package'
  | 'command'
  | 'port'
  | 'duration'
  | 'version'
  | 'plain';

export interface SemanticTerminalLocation {
  readonly filePath: string;
  readonly line: number | null;
  readonly column: number | null;
}

export interface SemanticTerminalToken {
  readonly type: SemanticTerminalTokenType;
  readonly value: string;
  readonly severity?: SemanticTerminalSeverity;
  readonly tool?: SemanticTerminalTool;
  readonly location?: SemanticTerminalLocation;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ParsedSemanticTerminalLine {
  readonly line: string;
  readonly severity: SemanticTerminalSeverity | null;
  readonly tool: SemanticTerminalTool;
  readonly tokens: readonly SemanticTerminalToken[];
  readonly documentationUrls: readonly string[];
  readonly locations: readonly SemanticTerminalLocation[];
  readonly errorCodes: readonly string[];
}

const TOOL_PATTERNS: readonly [SemanticTerminalTool, RegExp][] = [
  ['typescript', /\b(?:tsc|typescript|TS\d{4})\b/iu],
  ['eslint', /\b(?:eslint|ESLint)\b|(?:no-unused-vars|no-explicit-any|react-hooks\/rules-of-hooks)/u],
  ['prettier', /\bprettier\b/iu],
  ['vite', /\b(?:vite|plugin:vite|VITE_)\b/iu],
  ['vitest', /\b(?:vitest|vi\.|describe\(|it\()\b/iu],
  ['jest', /\bjest\b/iu],
  ['tsup', /\btsup\b/iu],
  ['rollup', /\brollup\b/iu],
  ['webpack', /\bwebpack\b/iu],
  ['babel', /\bbabel\b/iu],
  ['node', /\b(?:node|Node\.js|ERR_[A-Z0-9_]+)\b/u],
  ['pnpm', /\b(?:pnpm|ERR_PNPM_[A-Z0-9_]+)\b/u],
  ['npm', /\b(?:npm|npm ERR!|E[A-Z0-9]+)\b/u],
  ['yarn', /\byarn\b/iu],
  ['bun', /\bbun\b/iu],
  ['turbo', /\b(?:turbo|turborepo)\b/iu],
  ['git', /\b(?:git|fatal: not a git repository|merge conflict)\b/iu],
  ['docker', /\b(?:docker|docker-compose|container|image)\b/iu],
  ['prisma', /\b(?:prisma|P\d{4})\b/iu],
  ['nestjs', /\b(?:nestjs|@nestjs)\b/iu],
  ['electron', /\b(?:electron|BrowserWindow|ipcMain|ipcRenderer)\b/iu],
  ['tailwindcss', /\b(?:tailwindcss|tailwind|@tailwind|@theme)\b/iu],
  ['postcss', /\b(?:postcss|autoprefixer)\b/iu],
];

const SEVERITY_PATTERNS: readonly [SemanticTerminalSeverity, RegExp][] = [
  ['error', /\b(?:error|err|failed|failure|fatal|exception|uncaught|cannot|invalid|missing|denied|not found)\b|ERR_[A-Z0-9_]+|TS\d{4}|ELIFECYCLE/iu],
  ['warning', /\b(?:warn|warning|deprecated|deprecation)\b/iu],
  ['success', /\b(?:done|success|successful|passed|compiled successfully|ready in)\b/iu],
  ['debug', /\b(?:debug|trace|verbose)\b/iu],
  ['info', /\b(?:info|notice|started|starting|building|compiled|resolved)\b/iu],
];

const ERROR_CODE_PATTERNS: readonly RegExp[] = [
  /\bTS\d{4}\b/gu,
  /\bERR_PNPM_[A-Z0-9_]+\b/gu,
  /\bERR_[A-Z0-9_]+\b/gu,
  /\bE(?:ACCES|ADDRINUSE|EXIST|INVAL|ISDIR|NOENT|PERM|PIPE|CONNREFUSED|CONNRESET|TIMEDOUT|404|401|403)\b/gu,
  /\bP\d{4}\b/gu,
  /\b[A-Z][A-Z0-9]+(?:_[A-Z0-9]+)+\b/gu,
];

const URL_PATTERN = /https?:\/\/[^\s)'">]+/giu;

const PACKAGE_PATTERN =
  /(?:^|[\s("'`])(?<name>@[a-z0-9._-]+\/[a-z0-9._-]+|[a-z0-9][a-z0-9._-]*)(?=@|[\s,;:)'"]|$)/giu;

const FILE_LOCATION_PATTERN =
  /(?<file>(?:[A-Za-z]:)?(?:[./\\]|[a-zA-Z0-9_-])[\w./\\@()[\]-]+\.(?:ts|tsx|js|jsx|mjs|cjs|json|md|css|scss|sass|less|html|vue|svelte|astro|yml|yaml|toml|prisma|go|rs|py|java|kt|cs|cpp|c|h|hpp))(?::(?<line>\d+))?(?::(?<column>\d+))?/giu;

const COMMAND_PATTERN =
  /^\s*(?<prompt>[$❯>]|PS>|λ|➜)?\s*(?<command>(?:pnpm|npm|npx|yarn|bun|node|tsx|ts-node|git|turbo|vite|vitest|jest|eslint|prettier|tsc|docker|docker-compose|prisma|nest|electron)(?:\s+.+)?)$/iu;

const PORT_PATTERN = /\b(?:localhost:|127\.0\.0\.1:|0\.0\.0\.0:|port\s+)(?<port>\d{2,5})\b/giu;
const DURATION_PATTERN = /\b(?<duration>\d+(?:\.\d+)?\s?(?:ms|s|min|m))\b/giu;
const VERSION_PATTERN = /\b(?:v|version\s+)?(?<version>\d+\.\d+\.\d+(?:[-+][a-z0-9.]+)?)\b/giu;

const DOCUMENTATION_URL_BY_TOOL: Readonly<Partial<Record<SemanticTerminalTool, string>>> = {
  typescript: 'https://www.typescriptlang.org/docs/',
  eslint: 'https://eslint.org/docs/latest/',
  prettier: 'https://prettier.io/docs/',
  vite: 'https://vite.dev/guide/',
  vitest: 'https://vitest.dev/guide/',
  jest: 'https://jestjs.io/docs/getting-started',
  pnpm: 'https://pnpm.io/errors',
  npm: 'https://docs.npmjs.com/cli/v10/using-npm/config',
  yarn: 'https://yarnpkg.com/getting-started',
  bun: 'https://bun.sh/docs',
  turbo: 'https://turbo.build/repo/docs',
  git: 'https://git-scm.com/docs',
  docker: 'https://docs.docker.com/',
  prisma: 'https://www.prisma.io/docs',
  nestjs: 'https://docs.nestjs.com/',
  electron: 'https://www.electronjs.org/docs/latest/',
  tailwindcss: 'https://tailwindcss.com/docs',
  postcss: 'https://postcss.org/docs/',
};

const DOCUMENTATION_URL_BY_ERROR_PREFIX: readonly [RegExp, string][] = [
  [/^TS\d{4}$/u, 'https://typescript.tv/errors'],
  [/^ERR_PNPM_/u, 'https://pnpm.io/errors'],
  [/^ERR_/u, 'https://nodejs.org/api/errors.html'],
  [/^E(?:ACCES|ADDRINUSE|EXIST|INVAL|ISDIR|NOENT|PERM|PIPE|CONNREFUSED|CONNRESET|TIMEDOUT)$/u, 'https://nodejs.org/api/errors.html'],
  [/^P\d{4}$/u, 'https://www.prisma.io/docs/orm/reference/error-reference'],
];

const IGNORED_PACKAGE_WORDS = new Set([
  'error',
  'warning',
  'failed',
  'failure',
  'fatal',
  'exception',
  'not',
  'found',
  'get',
  'post',
  'put',
  'delete',
  'file',
  'line',
  'column',
  'plugin',
  'client',
  'server',
  'localhost',
]);

export function parseSemanticTerminalLine(line: string): SemanticTerminalToken[] {
  return parseSemanticTerminalOutputLine(line).tokens.slice();
}

export function parseSemanticTerminalOutputLine(line: string): ParsedSemanticTerminalLine {
  const tool = detectTool(line);
  const severity = detectSeverity(line);
  const tokens: SemanticTerminalToken[] = [];

  collectUrls(line, tokens);
  collectFileLocations(line, tokens);
  collectErrorCodes(line, tokens, tool, severity);
  collectCommand(line, tokens, tool);
  collectPorts(line, tokens);
  collectDurations(line, tokens);
  collectVersions(line, tokens);
  collectPackages(line, tokens);

  if (severity) {
    tokens.unshift({
      type: 'severity',
      value: severity,
      severity,
      tool,
    });
  }

  if (tool !== 'unknown') {
    tokens.unshift({
      type: 'tool',
      value: tool,
      tool,
      severity: severity ?? undefined,
    });
  }

  const documentationUrls = collectDocumentationUrls(tokens, tool);
  for (const documentationUrl of documentationUrls) {
    tokens.push({
      type: 'documentationUrl',
      value: documentationUrl,
      tool,
      severity: severity ?? undefined,
    });
  }

  if (tokens.length === 0) {
    tokens.push({
      type: 'plain',
      value: line,
      severity: severity ?? undefined,
      tool,
    });
  }

  return {
    line,
    severity,
    tool,
    tokens: dedupeTokens(tokens),
    documentationUrls,
    locations: tokens.flatMap((token) => token.location ? [token.location] : []),
    errorCodes: tokens.filter((token) => token.type === 'errorCode').map((token) => token.value),
  };
}

export function parseSemanticTerminalOutput(output: string): ParsedSemanticTerminalLine[] {
  return output
    .split(/\r?\n/u)
    .map((line) => parseSemanticTerminalOutputLine(line));
}

function detectTool(line: string): SemanticTerminalTool {
  for (const [tool, pattern] of TOOL_PATTERNS) {
    if (pattern.test(line)) {
      return tool;
    }
  }

  return 'unknown';
}

function detectSeverity(line: string): SemanticTerminalSeverity | null {
  for (const [severity, pattern] of SEVERITY_PATTERNS) {
    if (pattern.test(line)) {
      return severity;
    }
  }

  return null;
}

function collectUrls(line: string, tokens: SemanticTerminalToken[]): void {
  for (const match of line.matchAll(URL_PATTERN)) {
    tokens.push({
      type: 'url',
      value: match[0],
    });
  }
}

function collectFileLocations(line: string, tokens: SemanticTerminalToken[]): void {
  for (const match of line.matchAll(FILE_LOCATION_PATTERN)) {
    const filePath = match.groups?.file;
    if (!filePath) {
      continue;
    }

    const location: SemanticTerminalLocation = {
      filePath,
      line: parseNullableNumber(match.groups?.line),
      column: parseNullableNumber(match.groups?.column),
    };

    tokens.push({
      type: 'file',
      value: formatLocation(location),
      location,
    });
  }
}

function collectErrorCodes(
  line: string,
  tokens: SemanticTerminalToken[],
  tool: SemanticTerminalTool,
  severity: SemanticTerminalSeverity | null,
): void {
  const seen = new Set<string>();

  for (const pattern of ERROR_CODE_PATTERNS) {
    for (const match of line.matchAll(pattern)) {
      const code = match[0];

      if (seen.has(code)) {
        continue;
      }

      seen.add(code);

      tokens.push({
        type: 'errorCode',
        value: code,
        tool,
        severity: severity ?? 'error',
        metadata: {
          documentationUrl: resolveDocumentationUrlForErrorCode(code),
        },
      });
    }
  }
}

function collectCommand(line: string, tokens: SemanticTerminalToken[], tool: SemanticTerminalTool): void {
  const match = line.match(COMMAND_PATTERN);
  const command = match?.groups?.command;

  if (!command) {
    return;
  }

  tokens.push({
    type: 'command',
    value: command.trim(),
    tool,
  });
}

function collectPorts(line: string, tokens: SemanticTerminalToken[]): void {
  for (const match of line.matchAll(PORT_PATTERN)) {
    const port = match.groups?.port;

    if (!port) {
      continue;
    }

    tokens.push({
      type: 'port',
      value: port,
      metadata: {
        port: Number(port),
      },
    });
  }
}

function collectDurations(line: string, tokens: SemanticTerminalToken[]): void {
  for (const match of line.matchAll(DURATION_PATTERN)) {
    const duration = match.groups?.duration;

    if (!duration) {
      continue;
    }

    tokens.push({
      type: 'duration',
      value: duration,
    });
  }
}

function collectVersions(line: string, tokens: SemanticTerminalToken[]): void {
  for (const match of line.matchAll(VERSION_PATTERN)) {
    const version = match.groups?.version;

    if (!version) {
      continue;
    }

    tokens.push({
      type: 'version',
      value: version,
    });
  }
}

function collectPackages(line: string, tokens: SemanticTerminalToken[]): void {
  const existingValues = new Set(tokens.map((token) => token.value));

  for (const match of line.matchAll(PACKAGE_PATTERN)) {
    const packageName = match.groups?.name;

    if (!packageName || existingValues.has(packageName) || shouldIgnorePackageCandidate(packageName)) {
      continue;
    }

    tokens.push({
      type: 'package',
      value: packageName,
      metadata: {
        npmUrl: `https://www.npmjs.com/package/${encodeURIComponent(packageName).replace('%2F', '/')}`,
      },
    });
  }
}

function collectDocumentationUrls(
  tokens: readonly SemanticTerminalToken[],
  tool: SemanticTerminalTool,
): string[] {
  const urls = new Set<string>();

  const toolDocumentationUrl = DOCUMENTATION_URL_BY_TOOL[tool];

  if (toolDocumentationUrl) {
    urls.add(toolDocumentationUrl);
  }

  for (const token of tokens) {
    if (token.type !== 'errorCode') {
      continue;
    }

    const explicitUrl = token.metadata?.documentationUrl;

    if (typeof explicitUrl === 'string') {
      urls.add(explicitUrl);
    }
  }

  return [...urls];
}

function resolveDocumentationUrlForErrorCode(code: string): string | null {
  for (const [pattern, url] of DOCUMENTATION_URL_BY_ERROR_PREFIX) {
    if (pattern.test(code)) {
      return url;
    }
  }

  return null;
}

function parseNullableNumber(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatLocation(location: SemanticTerminalLocation): string {
  const line = location.line === null ? '' : `:${location.line}`;
  const column = location.column === null ? '' : `:${location.column}`;

  return `${location.filePath}${line}${column}`;
}

function shouldIgnorePackageCandidate(value: string): boolean {
  const normalized = value.toLowerCase();

  if (IGNORED_PACKAGE_WORDS.has(normalized)) {
    return true;
  }

  if (/^\d/u.test(normalized)) {
    return true;
  }

  if (normalized.includes('.') && !normalized.startsWith('@')) {
    return true;
  }

  if (/^(?:http|https)$/u.test(normalized)) {
    return true;
  }

  return false;
}

function dedupeTokens(tokens: readonly SemanticTerminalToken[]): SemanticTerminalToken[] {
  const seen = new Set<string>();
  const deduped: SemanticTerminalToken[] = [];

  for (const token of tokens) {
    const key = `${token.type}:${token.value}:${token.location?.line ?? ''}:${token.location?.column ?? ''}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(token);
  }

  return deduped;
}