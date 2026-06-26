/**
 * Extract Chinese strings from Vue files for i18n migration.
 * Usage: node scripts/extract-chinese-strings.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../src');

const CHINESE_RE = /[\u4e00-\u9fff]+/g;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') walk(full, files);
    else if (entry.name.endsWith('.vue')) files.push(full);
  }
  return files;
}

function slugify(text) {
  return text
    .replace(/[^\u4e00-\u9fff\w\s]/g, '')
    .trim()
    .slice(0, 40);
}

const strings = new Map();

for (const file of walk(root)) {
  const content = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const module = rel.split('/')[1] || 'core';
  const matches = content.match(CHINESE_RE) || [];
  for (const m of matches) {
    const text = m.trim();
    if (text.length < 2) continue;
    if (/^[\u4e00-\u9fff]{1}$/.test(text)) continue;
    if (!strings.has(text)) {
      strings.set(text, { count: 0, modules: new Set(), files: new Set() });
    }
    const entry = strings.get(text);
    entry.count++;
    entry.modules.add(module);
    entry.files.add(rel);
  }
}

const sorted = [...strings.entries()].sort((a, b) => b[1].count - a[1].count);
console.log(`Total unique Chinese strings: ${sorted.length}`);
console.log('Top 30 most frequent:');
sorted.slice(0, 30).forEach(([text, info]) => {
  console.log(`  [${info.count}x] ${text}`);
});

const outPath = path.resolve(__dirname, '../src/locales/extracted-zh.json');
const output = Object.fromEntries(sorted.map(([text]) => [slugify(text) || text, text]));
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`\nWrote ${outPath} (${Object.keys(output).length} entries)`);
