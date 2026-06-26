import fs from 'fs';
import path from 'path';

const ROOT = 'src/views/operateManager';
const chinese = /[\u4e00-\u9fff]/;

function stripComments(line) {
  let s = line;
  const html = s.match(/<!--([\s\S]*?)-->/);
  if (html) s = s.replace(/<!--[\s\S]*?-->/g, '');
  const block = s.indexOf('/*');
  if (block >= 0) {
    const end = s.indexOf('*/', block);
    if (end >= 0) s = s.slice(0, block) + s.slice(end + 2);
  }
  const slash = s.indexOf('//');
  if (slash >= 0) s = s.slice(0, slash);
  return s;
}

function isCommentOnly(line) {
  const t = line.trim();
  if (!chinese.test(t)) return true;
  if (t.startsWith('//')) return true;
  if (t.startsWith('*') || t.startsWith('/*') || t.endsWith('*/')) return true;
  if (t.startsWith('<!--') && t.endsWith('-->')) return true;
  if (!chinese.test(stripComments(line))) return true;
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
const remaining = [];

for (const file of walk(ROOT)) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!chinese.test(line)) continue;
    totalAll++;
    if (!isCommentOnly(line)) {
      totalNonComment++;
      remaining.push({ file, line: i + 1, text: line.trim().slice(0, 120) });
    }
  }
}

console.log('=== Chinese in operateManager/ (strict: excludes inline // and HTML comments) ===');
console.log(`Total lines with Chinese: ${totalAll}`);
console.log(`User-facing (non-comment) lines: ${totalNonComment}`);
if (remaining.length) {
  console.log('\nRemaining user-facing lines:');
  for (const r of remaining) {
    console.log(`  ${r.file.replace(/\\/g, '/')}:${r.line} ${r.text}`);
  }
}
