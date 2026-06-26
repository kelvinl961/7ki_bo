import fs from 'node:fs';
import path from 'node:path';

const CH = /[\u4e00-\u9fff]/;
function flatten(o, p = '', m = {}) {
  for (const [k, v] of Object.entries(o || {})) {
    const x = p ? `${p}.${k}` : k;
    if (typeof v === 'string') m[x] = v;
    else if (v && typeof v === 'object') flatten(v, x, m);
  }
  return m;
}
function walkDir(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walkDir(f, a);
    else if (f.endsWith('.vue')) a.push(f);
  }
  return a;
}

const flat = flatten(JSON.parse(fs.readFileSync('src/locales/langs/vi-VN/activity.json', 'utf8')));
const used = new Set();
for (const f of [...walkDir('src/views/activity'), ...walkDir('src/views/user')]) {
  const s = fs.readFileSync(f, 'utf8');
  const re = /\$t\(['"]activity\.([^'"]+)/g;
  let m;
  while ((m = re.exec(s))) used.add(m[1]);
}

let badUsed = 0;
for (const k of used) {
  const v = flat[k];
  if (typeof v === 'string' && CH.test(v)) {
    badUsed++;
    console.log('USED', k, ':', v.slice(0, 80));
  }
}
console.log('Used bad:', badUsed);

const unusedBad = Object.entries(flat).filter(([k, v]) => CH.test(v) && !used.has(k));
console.log('Unused bad:', unusedBad.length);
unusedBad.slice(0, 15).forEach(([k, v]) => console.log(' ', k, ':', v.slice(0, 60)));
