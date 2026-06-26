/**
 * Fix broken i18n patterns like '{{ $t('key') }}' in script strings.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../src');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') walk(full, files);
    else if (entry.name.endsWith('.vue')) files.push(full);
  }
  return files;
}

function fixContent(content) {
  let result = content;

  // '{{ $t('namespace.key') }}' -> $t('namespace.key')
  result = result.replace(
    /'(\{\{\s*\$t\('([^']+)'\)\s*\}\})'/g,
    (_, _full, key) => `$t('${key}')`,
  );
  result = result.replace(
    /"(\{\{\s*\$t\('([^']+)'\)\s*\}\})"/g,
    (_, _full, key) => `$t('${key}')`,
  );

  // Mixed: 'prefix{{ $t('key') }}suffix' -> use template with $t
  result = result.replace(
    /'([^'{}]*)\{\{\s*\$t\('([^']+)'\)\s*\}\}([^']*)'/g,
    (match, prefix, key, suffix) => {
      if (!prefix && !suffix) return `$t('${key}')`;
      const parts = [];
      if (prefix) parts.push(`'${prefix}'`);
      parts.push(`$t('${key}')`);
      if (suffix) parts.push(`'${suffix}'`);
      return parts.join(' + ');
    },
  );

  // Broken template tag <:Page -> <Page
  result = result.replace(/<:Page\b/g, '<Page');

  return result;
}

let changed = 0;
for (const file of walk(root)) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = fixContent(original);
  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    changed++;
  }
}
console.log(`Fixed ${changed} files`);
