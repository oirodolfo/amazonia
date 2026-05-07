import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const markers = ['package.json', 'pnpm-workspace.yaml', 'turbo.json', 'nx.json', 'src/shared', 'src/workspace', 'src/terminal'];
console.log('🌳 Curupira Workbench repository scan');
for (const marker of markers) {
  const fullPath = path.join(root, marker);
  console.log(`${fs.existsSync(fullPath) ? '✅' : '⚪'} ${marker}`);
}
console.log('Scan complete. Reuse candidates should be preferred before adding new modules.');
