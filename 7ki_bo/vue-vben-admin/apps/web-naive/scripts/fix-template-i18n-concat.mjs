/**
 * Fix broken Vue template patterns:
 *   ' + $t('key') + '  -> {{ $t('key') }}
 *   'prefix' + $t('key') -> prefix{{ $t('key') }}
 * Only modifies <template> sections; script bindings like $t('a') + ' ' + $t('b') are untouched.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../src');
const commonPath = path.resolve(
  __dirname,
  '../../../packages/locales/src/langs/en-US/common.json',
);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') walk(full, files);
    else if (entry.name.endsWith('.vue')) files.push(full);
  }
  return files;
}

function fixTemplate(template) {
  let result = template;

  result = result.replace(
    /' \+ \$t\('([^']+)'\) \+ '/g,
    (_, key) => `{{ $t('${key}') }}`,
  );

  result = result.replace(/<<template/g, '<template');

  return result;
}

function fixVueFile(content) {
  const templateRe = /<template([\s\S]*?)<\/template>/g;
  if (!templateRe.test(content)) return content;

  return content.replace(
    /<template([\s\S]*?)<\/template>/g,
    (match) => fixTemplate(match),
  );
}

let changed = 0;
for (const file of walk(root)) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = fixVueFile(original);
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    changed++;
    console.log('fixed:', path.relative(root, file));
  }
}

const common = JSON.parse(fs.readFileSync(commonPath, 'utf8'));
const defined = new Set(Object.keys(common));
const used = new Set();
for (const file of walk(root)) {
  const content = fs.readFileSync(file, 'utf8');
  for (const m of content.matchAll(/\$t\('common\.([a-zA-Z0-9]+)'/g)) {
    used.add(m[1]);
  }
}
const missing = [...used].filter((k) => !defined.has(k)).sort();
console.log(`\nFixed ${changed} Vue files`);
console.log(
  missing.length
    ? `Missing en-US common keys: ${missing.join(', ')}`
    : 'All used common.* keys exist in en-US common.json',
);
