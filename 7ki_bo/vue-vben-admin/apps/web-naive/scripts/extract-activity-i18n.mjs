import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../src/views/activity');
const pat = /[\u4e00-\u9fff][^\n'"]{0,120}/g;
const strings = new Set();
const fileCounts = {};

function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (f.endsWith('.vue')) {
      const c = fs.readFileSync(p, 'utf8');
      const matches = [...c.matchAll(pat)].map((m) => m[0].trim());
      if (matches.length) {
        fileCounts[path.relative(root, p)] = matches.length;
        matches.forEach((s) => strings.add(s));
      }
    }
  }
}

walk(root);
console.log('unique', strings.size);
Object.entries(fileCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([f, n]) => console.log(n, f));

fs.writeFileSync(
  path.join(__dirname, 'activity-strings.json'),
  JSON.stringify([...strings].sort(), null, 2),
  'utf8',
);
