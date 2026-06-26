import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const financeDir = path.join(__dirname, '../src/views/finance');
const strings = new Set();

for (const f of fs.readdirSync(financeDir).filter((x) => x.endsWith('.vue'))) {
  const c = fs.readFileSync(path.join(financeDir, f), 'utf8');
  const re = /['"`]([^'"`\n]{1,120}[\u4e00-\u9fff][^'"`\n]{0,120})['"`]/g;
  let m;
  while ((m = re.exec(c))) {
    const s = m[1];
    if (!s.includes('//') && !s.includes('/*') && !s.includes('${')) {
      strings.add(s);
    }
  }
}

const sorted = [...strings].sort((a, b) => a.length - b.length);
fs.writeFileSync(
  path.join(__dirname, 'finance-strings-raw.json'),
  JSON.stringify(sorted, null, 2),
  'utf8',
);
console.log('Total unique strings:', sorted.length);
