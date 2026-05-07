import fs from 'node:fs';
import path from 'node:path';

const MINIMUM_FILE_COUNT = 70;
const REQUIRED_FILES = ['README.md', 'CHANGELOG.md', 'package.json', 'src/main/main.ts', 'src/preload/preload.ts', 'src/renderer/main.tsx'];

/**
 * Validates that the package is not a tiny placeholder before zipping.
 *
 * @returns Nothing. Throws when the artifact shape is suspicious.
 *
 * @example
 * ```ts
 * // pnpm validate:artifact
 * ```
 */
function main(): void {
  const root = findRepositoryRoot(process.cwd());
  const files = listFiles(root).filter((file) => !file.includes('node_modules'));
  const missing = REQUIRED_FILES.filter((file) => !fs.existsSync(path.join(root, file)));

  if (missing.length > 0) {
    throw new Error(`Missing required files: ${missing.join(', ')}`);
  }

  if (files.length < MINIMUM_FILE_COUNT) {
    throw new Error(`Artifact looks too small: ${files.length} files found, expected at least ${MINIMUM_FILE_COUNT}.`);
  }

  console.log(`🌳 Artifact validated with ${files.length} files.`);
}

function findRepositoryRoot(start: string): string {
  let current = path.resolve(start);
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'package.json'))) return current;
    current = path.dirname(current);
  }
  return path.resolve(start);
}

function listFiles(directory: string): readonly string[] {
  const result: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...listFiles(fullPath).map((file) => path.join(entry.name, file)));
      continue;
    }
    result.push(entry.name);
  }
  return result;
}

main();
