/** Fix label:label= title:title= tab:tab= broken attribute prefixes in finance views */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/views/finance');
const ATTRS = ['label', 'title', 'tab', 'description'];

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.vue'))) {
  const fp = path.join(dir, file);
  let c = fs.readFileSync(fp, 'utf8');
  const orig = c;
  for (const attr of ATTRS) {
    c = c.replace(new RegExp(`\\b${attr}:${attr}=`, 'g'), `:${attr}=`);
  }
  if (c !== orig) {
    fs.writeFileSync(fp, c, 'utf8');
    console.log('Fixed attrs:', file);
  }
}
