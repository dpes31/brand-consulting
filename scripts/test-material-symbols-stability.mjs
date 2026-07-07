import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('index.html');
const css = read('src/index.css');
const main = read('src/main.tsx');
const guard = read('src/lib/installMaterialSymbolsReady.ts');

assert.match(html, /lang="ko"/);
assert.match(html, /material-symbols-pending/);
assert.match(html, /fonts\.googleapis\.com/);
assert.match(html, /fonts\.gstatic\.com/);
assert.match(html, /Material\+Symbols\+Outlined[^\n]+display=block/);

assert.match(css, /\.material-symbols-outlined\s*\{/);
assert.match(css, /width:\s*1em/);
assert.match(css, /min-width:\s*1em/);
assert.match(css, /visibility:\s*hidden/);
assert.match(css, /html\.material-symbols-ready \.material-symbols-outlined/);
assert.match(css, /visibility:\s*visible/);
assert.match(css, /font-feature-settings:\s*'liga'/);

assert.match(main, /installMaterialSymbolsReady/);
assert.ok(
  main.indexOf('installMaterialSymbolsReady()') < main.indexOf('createRoot('),
  'Material Symbols guard must run before React renders',
);

assert.match(guard, /document\.fonts\.load/);
assert.match(guard, /document\.fonts\.check/);
assert.match(guard, /material-symbols-ready/);
assert.match(guard, /material-symbols-pending/);

console.log('Material Symbols first-paint stability contract passed.');
