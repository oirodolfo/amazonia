import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import type {PackageManager, WorkspaceAction, WorkspaceManifest, WorkspacePackage} from '@/shared/types';

interface PackageJsonFile {
    readonly name?: string;
    readonly packageManager?: string;
    readonly scripts?: Record<string, string>;
    readonly workspaces?: readonly string[] | { readonly packages?: readonly string[] };
}

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.turbo', '.nx', 'coverage']);

/**
 * Scans a repository and creates a normalized action graph for the workbench.
 *
 * @param rootPath - Absolute path to the workspace root.
 * @returns A manifest containing packages, scripts and turbo/nx aware actions.
 *
 * @example
 * ```ts
 * const manifest = await scanWorkspace('/repo');
 * manifest.actions.map((action) => action.command);
 * ```
 */
export async function scanWorkspace(rootPath: string): Promise<WorkspaceManifest> {
    const normalizedRoot = path.resolve(rootPath);
    const rootPackage = await readPackageJson(normalizedRoot);
    const hasPnpmWorkspace = await exists(path.join(normalizedRoot, 'pnpm-workspace.yaml'));
    const hasTurbo = await exists(path.join(normalizedRoot, 'turbo.json'));
    const hasNx = await exists(path.join(normalizedRoot, 'nx.json'));
    const packageManager = detectPackageManager(rootPackage.packageManager, normalizedRoot);
    const packageDirs = await discoverPackageDirs(normalizedRoot, rootPackage, hasPnpmWorkspace);
    const packages = await Promise.all(packageDirs.map((packagePath) => toWorkspacePackage(normalizedRoot, packagePath)));
    const sortedPackages = packages
        .filter((pkg): pkg is WorkspacePackage => Boolean(pkg))
        .sort((left, right) => left.relativePath.localeCompare(right.relativePath));
    const actions = buildActions(sortedPackages, {packageManager, hasTurbo, hasNx});

    return {
        rootPath: normalizedRoot,
        name: rootPackage.name ?? path.basename(normalizedRoot),
        packageManager,
        hasPnpmWorkspace,
        hasTurbo,
        hasNx,
        packages: sortedPackages,
        actions,
        scannedAtIso: new Date().toISOString(),
    };
}

async function readPackageJson(directory: string): Promise<PackageJsonFile> {
    const filePath = path.join(directory, 'package.json');
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as PackageJsonFile;
}

async function discoverPackageDirs(rootPath: string, rootPackage: PackageJsonFile, hasPnpmWorkspace: boolean): Promise<string[]> {
    const dirs = new Set<string>([rootPath]);
    const patterns = new Set<string>();

    for (const pattern of getWorkspacePatterns(rootPackage)) patterns.add(pattern);

    if (hasPnpmWorkspace) {
        const workspaceRaw = await fs.readFile(path.join(rootPath, 'pnpm-workspace.yaml'), 'utf8');
        const workspace = YAML.parse(workspaceRaw) as { packages?: string[] } | null;
        for (const pattern of workspace?.packages ?? []) patterns.add(pattern);
    }

    if (patterns.size === 0) {
        for (const directoryName of ['apps', 'packages', 'tooling']) patterns.add(`${directoryName}/*`);
    }

    for (const pattern of patterns) {
        if (pattern.startsWith('!')) continue;
        const prefix = pattern.replace(/\/\*\*?$/u, '');
        const basePath = path.join(rootPath, prefix);
        for (const packagePath of await findPackageJsonDirs(basePath)) dirs.add(packagePath);
    }

    return [...dirs];
}

function getWorkspacePatterns(rootPackage: PackageJsonFile): readonly string[] {
    const workspaces = rootPackage.workspaces;
    if (Array.isArray(workspaces)) {
        return workspaces;
    }
    if (workspaces && typeof workspaces === 'object' && 'packages' in workspaces) {
        return workspaces.packages ?? [];
    }
    return [];
}

async function findPackageJsonDirs(directory: string): Promise<string[]> {
    if (!(await exists(directory))) return [];
    const entries = await fs.readdir(directory, {withFileTypes: true});
    const result: string[] = [];

    for (const entry of entries) {
        if (!entry.isDirectory() || IGNORED_DIRS.has(entry.name)) continue;
        const child = path.join(directory, entry.name);
        if (await exists(path.join(child, 'package.json'))) result.push(child);
    }

    return result;
}

async function toWorkspacePackage(rootPath: string, packagePath: string): Promise<WorkspacePackage | null> {
    try {
        const packageJson = await readPackageJson(packagePath);
        const relativePath = path.relative(rootPath, packagePath) || '.';
        const name = packageJson.name ?? (relativePath === '.' ? path.basename(rootPath) : relativePath.replaceAll(path.sep, '/'));
        return {
            id: Buffer.from(packagePath).toString('base64url'),
            name,
            path: packagePath,
            relativePath,
            scripts: packageJson.scripts ?? {},
            isRoot: packagePath === rootPath,
        };
    } catch {
        return null;
    }
}

function buildActions(
    packages: readonly WorkspacePackage[],
    options: { readonly packageManager: PackageManager; readonly hasTurbo: boolean; readonly hasNx: boolean },
): readonly WorkspaceAction[] {
    const actions: WorkspaceAction[] = [];
    const runner = options.packageManager === 'unknown' ? 'npm' : options.packageManager;

    for (const workspacePackage of packages) {
        for (const [scriptName, scriptCommand] of Object.entries(workspacePackage.scripts)) {
            actions.push({
                id: `${workspacePackage.id}:${scriptName}`,
                packageId: workspacePackage.id,
                packageName: workspacePackage.name,
                label: scriptName,
                command: workspacePackage.isRoot ? `${runner} run ${scriptName}` : `${runner} --filter ${workspacePackage.name} run ${scriptName}`,
                cwd: workspacePackage.path,
                kind: 'script',
                weight: defaultScriptWeight(scriptName),
                description: scriptCommand,
            });

            if (options.hasTurbo) {
                actions.push({
                    id: `${workspacePackage.id}:turbo:${scriptName}`,
                    packageId: workspacePackage.id,
                    packageName: workspacePackage.name,
                    label: `turbo ${scriptName}`,
                    command: `turbo run ${scriptName}${workspacePackage.isRoot ? '' : ` --filter=${workspacePackage.name}`}`,
                    cwd: workspacePackage.path,
                    kind: 'turbo',
                    weight: defaultScriptWeight(scriptName) + 10,
                    description: `Turbo-aware ${scriptName}`,
                });
            }

            if (options.hasNx) {
                actions.push({
                    id: `${workspacePackage.id}:nx:${scriptName}`,
                    packageId: workspacePackage.id,
                    packageName: workspacePackage.name,
                    label: `nx ${scriptName}`,
                    command: `nx run ${workspacePackage.name}:${scriptName}`,
                    cwd: workspacePackage.path,
                    kind: 'nx',
                    weight: defaultScriptWeight(scriptName) + 8,
                    description: `Nx-aware ${scriptName}`,
                });
            }
        }
    }

    return actions.sort((left, right) => right.weight - left.weight || left.packageName.localeCompare(right.packageName) || left.label.localeCompare(right.label));
}

function defaultScriptWeight(scriptName: string): number {
    const weights: Record<string, number> = {
        dev: 100,
        start: 95,
        test: 90,
        build: 85,
        lint: 75,
        typecheck: 70,
        preview: 60
    };
    return weights[scriptName] ?? 10;
}

function detectPackageManager(packageManager: string | undefined, rootPath: string): PackageManager {
    if (packageManager?.startsWith('pnpm')) return 'pnpm';
    if (packageManager?.startsWith('yarn')) return 'yarn';
    if (packageManager?.startsWith('bun')) return 'bun';
    if (packageManager?.startsWith('npm')) return 'npm';
    if (fsSyncExists(path.join(rootPath, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fsSyncExists(path.join(rootPath, 'yarn.lock'))) return 'yarn';
    if (fsSyncExists(path.join(rootPath, 'bun.lockb'))) return 'bun';
    if (fsSyncExists(path.join(rootPath, 'package-lock.json'))) return 'npm';
    return 'unknown';
}

async function exists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

function fsSyncExists(filePath: string): boolean {
    try {
        return fsSync.existsSync(filePath);
    } catch {
        return false;
    }
}
