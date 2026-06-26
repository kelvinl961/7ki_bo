import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/views/finance');
const visible = [];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.vue'))) {
  const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (!/[\u4e00-\u9fff]/.test(line)) return;
    const t = line.trim();
    if (t.startsWith('//') || t.startsWith('*') || /<!--.*-->/.test(t)) return;
    if (t.startsWith('<!--') || t.endsWith('-->')) return;
    if (line.includes('<!--') && !line.includes('-->')) return;
    visible.push(`${f}:${i + 1}: ${t.slice(0, 120)}`);
  });
}
console.log('Visible UI Chinese lines:', visible.length);
visible.slice(0, 60).forEach((l) => console.log(l));
