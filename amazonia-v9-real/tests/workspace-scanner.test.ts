import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { scanWorkspace } from '@/workspace';

async function createFixture(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'amazonia-workspace-'));
  await fs.mkdir(path.join(root, 'packages', 'logger'), { recursive: true });
  await fs.writeFile(path.join(root, 'package.json'), JSON.stringify({ name: 'fixture-root', packageManager: 'pnpm@10.0.0', scripts: { dev: 'vite', build: 'tsc' } }, null, 2));
  await fs.writeFile(path.join(root, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
  await fs.writeFile(path.join(root, 'turbo.json'), JSON.stringify({ tasks: { build: {} } }));
  await fs.writeFile(path.join(root, 'nx.json'), JSON.stringify({ affected: {} }));
  await fs.writeFile(path.join(root, 'packages/logger/package.json'), JSON.stringify({ name: '@fixture/logger', scripts: { test: 'vitest', lint: 'eslint .' } }, null, 2));
  return root;
}

describe('scanWorkspace', () => {
  it('detects packages, scripts, turbo actions and nx actions', async () => {
    const root = await createFixture();
    const manifest = await scanWorkspace(root);

    expect(manifest.hasPnpmWorkspace).toBe(true);
    expect(manifest.hasTurbo).toBe(true);
    expect(manifest.hasNx).toBe(true);
    expect(manifest.packages.map((item) => item.name)).toContain('@fixture/logger');
    expect(manifest.actions.some((action) => action.kind === 'turbo' && action.command.includes('turbo run test'))).toBe(true);
    expect(manifest.actions.some((action) => action.kind === 'nx' && action.command.includes('nx run @fixture/logger:test'))).toBe(true);
  });
});
