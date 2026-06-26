/**
 * Remove corrupted $t('finance.div...') fragments injected into finance Vue templates.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const financeDir = path.join(__dirname, '../src/views/finance');

const GARBAGE_RE = /\$t\('finance\.(?:div|span|n|0)[^']*'\)/g;

const FIXES = [
  [
    /@update:value="handleDateRangeChange"?\s*mb-4 flex flex-wrap items-end gap-4">/,
    `@update:value="handleDateRangeChange"
              />
            </div>
          </div>

          <div class="mb-4 flex flex-wrap items-end gap-4">`,
  ],
  [
    /class="flex items-center gap-4"\s*class="flex gap-2"/g,
    'class="flex items-center gap-4">\n                <div class="flex gap-2"',
  ],
  [
    /class="flex items-center gap-4([^">]*?)class="flex gap-2"/g,
    'class="flex items-center gap-4$1">\n                <div class="flex gap-2"',
  ],
  [
    /text-gray-500([^">]*?)class="/g,
    'text-gray-500$1">\n                <div class="',
  ],
  [
    /text-gray-600([^">]*?)class="/g,
    'text-gray-600$1">\n                <div class="',
  ],
  [
    /:bordered="true([^">]*?)class="/g,
    ':bordered="true$1">\n            <div class="',
  ],
  [
    /py-4 text-center text-gray-500([^">]*?)class="/g,
    'py-4 text-center text-gray-500$1">\n              <div class="',
  ],
  [
    /text-sm text-gray-600([^">]*?)class="/g,
    'text-sm text-gray-600$1">\n            <div class="',
  ],
  [
    /mb-4 text-center text-sm text-gray-500([^">]*?)class="/g,
    'mb-4 text-center text-sm text-gray-500$1">\n          <div class="',
  ],
  [
    /:tab="\$t\('finance\.[^']+'\)\$t\('finance\.[^']+'\)/g,
    (m) => m, // manual below
  ],
];

for (const file of fs.readdirSync(financeDir).filter((f) => f.endsWith('.vue'))) {
  const fp = path.join(financeDir, file);
  let content = fs.readFileSync(fp, 'utf8');
  const original = content;

  content = content.replace(GARBAGE_RE, '');

  for (const [re, repl] of FIXES) {
    content = content.replace(re, repl);
  }

  // Fix merged handler + class fragments
  content = content.replace(
    /(@update:value="[^"]+)(mb-4 flex[^"]*?)">/g,
    '$1"\n              />\n            </div>\n          </div>\n\n          <div class="$2">',
  );

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf8');
    console.log('Fixed', file);
  }
}
