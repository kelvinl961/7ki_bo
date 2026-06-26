/**
 * Fix broken i18n template patterns like ' + $t('key') + '
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../src/views/finance');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.vue')) files.push(full);
  }
  return files;
}

function fix(content) {
  let result = content;
  // ' + $t('key') + ' -> {{ $t('key') }}
  result = result.replace(/' \+ \$t\('([^']+)'\) \+ '/g, "{{ $t('$1') }}");
  // >' + $t('key') + '< -> >{{ $t('key') }}<
  result = result.replace(/>\s*' \+ \$t\('([^']+)'\) \+ '\s*</g, ">{{ $t('$1') }}<");
  return result;
}

let changed = 0;
for (const file of walk(root)) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = fix(original);
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    changed++;
    console.log('fixed:', path.basename(file));
  }
}
console.log(`Done: ${changed} files`);
