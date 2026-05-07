import { describe, expect, it } from 'vitest';
import { createActionIndex, groupActionIndexByPackage, searchActionIndex } from '@/workspace/action-index';
import type { WorkspaceManifest } from '@/shared/types';

const workspace: WorkspaceManifest = {
  rootPath: '/repo',
  name: 'repo',
  packageManager: 'pnpm',
  hasPnpmWorkspace: true,
  hasTurbo: true,
  hasNx: false,
  scannedAtIso: '2026-05-04T00:00:00.000Z',
  packages: [
    { id: 'api', name: '@repo/api', path: '/repo/apps/api', relativePath: 'apps/api', scripts: { test: 'vitest' }, isRoot: false },
  ],
  actions: [
    { id: 'api:test', packageId: 'api', packageName: '@repo/api', label: 'test', command: 'pnpm --filter @repo/api run test', cwd: '/repo/apps/api', kind: 'script', weight: 90, description: 'vitest' },
    { id: 'api:build', packageId: 'api', packageName: '@repo/api', label: 'build', command: 'pnpm --filter @repo/api run build', cwd: '/repo/apps/api', kind: 'script', weight: 85, description: 'tsc' },
  ],
};

describe('action index', () => {
  it('ranks package and script matches', () => {
    const matches = searchActionIndex(createActionIndex(workspace), 'api test');

    expect(matches[0]?.entry.action.id).toBe('api:test');
    expect(matches[0]?.score).toBeGreaterThan(100);
  });

  it('groups entries by package', () => {
    const grouped = groupActionIndexByPackage(createActionIndex(workspace));

    expect(grouped.get('api')).toHaveLength(2);
  });
});
