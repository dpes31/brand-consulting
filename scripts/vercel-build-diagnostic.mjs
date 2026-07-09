import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const strict = spawnSync('npm', ['run', 'build:strict'], {
  encoding: 'utf8',
  env: process.env,
});
const output = `${strict.stdout || ''}\n${strict.stderr || ''}`.trim();
process.stdout.write(`${output}\n`);

if (strict.status === 0) process.exit(0);
if (process.env.VERCEL !== '1') process.exit(strict.status || 1);

console.error('[diagnostic] strict build failed; publishing build-error.txt for the active Preview only.');
const fallback = spawnSync('npx', ['vite', 'build'], {
  encoding: 'utf8',
  env: process.env,
});
process.stdout.write(`${fallback.stdout || ''}\n${fallback.stderr || ''}`);
if (fallback.status !== 0) process.exit(fallback.status || 1);

mkdirSync('dist', { recursive: true });
writeFileSync('dist/build-error.txt', output || 'Unknown strict build failure', 'utf8');
