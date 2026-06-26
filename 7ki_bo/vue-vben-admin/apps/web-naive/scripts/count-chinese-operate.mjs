import fs from 'fs';
import path from 'path';

const ROOT = 'src/views/operateManager';
const chinese = /[\u4e00-\u9fff]/;

function isCommentOnly(line) {
  const t = line.trim();
  if (!chinese.test(t)) return true;
  if (t.startsWith('//')) return true;
  if (t.startsWith('*') || t.startsWith('/*') || t.endsWith('*/')) return true;
  if (/<!--.*[\u4e00-\u9fff].*-->/.test(t) && !t.replace(/<!--[\s\S]*?-->/g, '').match(chinese))
    return true;
  if (/^\s*\/\//.test(line)) return true;
  return false;
}

function walk(dir, files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (p.endsWith('.vue')) files.push(p);
  }
  return files;
}

let totalAll = 0;
let totalNonComment = 0;
const byFile = [];

for (const file of walk(ROOT)) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let all = 0;
  let nonComment = 0;
  for (const line of lines) {
    if (!chinese.test(line)) continue;
    all++;
    if (!isCommentOnly(line)) nonComment++;
  }
  if (all > 0) {
    byFile.push({ file: file.replace(/\\/g, '/'), all, nonComment });
    totalAll += all;
    totalNonComment += nonComment;
  }
}

byFile.sort((a, b) => b.nonComment - a.nonComment);
console.log('=== Chinese in operateManager/ ===');
console.log(`Total lines with Chinese: ${totalAll}`);
console.log(`Non-comment lines with Chinese: ${totalNonComment}`);
console.log('\nTop files (non-comment):');
for (const { file, all, nonComment } of byFile.filter((f) => f.nonComment > 0).slice(0, 25)) {
  console.log(`  ${nonComment} (${all} total) ${file}`);
}
