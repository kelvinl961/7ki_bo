/**
 * Safe activity i18n applier — only replaces explicit UI string patterns.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '..');
const activityRoot = path.join(appRoot, 'src/views/activity');

function walkVueFiles(dir, base = '') {
  const files = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const rel = base ? `${base}/${f}` : f;
    if (fs.statSync(p).isDirectory()) files.push(...walkVueFiles(p, rel));
    else if (f.endsWith('.vue')) files.push({ abs: p, rel });
  }
  return files;
}

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, p));
    else out[p] = v;
  }
  return out;
}

const zhJson = JSON.parse(
  fs.readFileSync(path.join(appRoot, 'src/locales/langs/zh-CN/activity.json'), 'utf8'),
);
const flat = flatten(zhJson);
const zhToKey = {};
for (const [key, val] of Object.entries(flat)) {
  if (typeof val === 'string' && /[\u4e00-\u9fff]/.test(val)) {
    if (!zhToKey[val]) zhToKey[val] = `activity.${key}`;
  }
}

const sorted = Object.entries(zhToKey).sort((a, b) => b[0].length - a[0].length);

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureImport(content) {
  if (content.includes("from '@vben/locales'")) return content;
  const m = content.match(/<script setup[^>]*>/);
  if (!m) return content;
  return content.replace(m[0], `${m[0]}\nimport { $t } from '@vben/locales';\n`);
}

function apply(content) {
  let r = content;
  for (const [zh, tKey] of sorted) {
    const e = esc(zh);
    // Static HTML attributes only (not :bound)
    for (const attr of [
      'label',
      'placeholder',
      'title',
      'tab',
      'description',
      'content',
      'positive-text',
      'negative-text',
    ]) {
      r = r.replace(new RegExp(`(?<![:\\w-])${attr}="${e}"`, 'g'), `:${attr}="$t('${tKey}')"`);
      r = r.replace(new RegExp(`(?<![:\\w-])${attr}='${e}'`, 'g'), `:${attr}="$t('${tKey}')"`);
    }
    // Standalone text between tags (not inside attributes)
    r = r.replace(new RegExp(`(?<=>)\\s*${e}\\s*(?=<)`, 'g'), `{{ $t('${tKey}') }}`);
    // Script: message.xxx('...')
    r = r.replace(
      new RegExp(`(message\\.(?:success|error|warning|info)|dialog\\.warning)\\((['"])${e}\\2`, 'g'),
      `$1($t('${tKey}')`,
    );
    // Object properties: label: '...', text: '...'
    r = r.replace(
      new RegExp(`\\b(label|text|title|message):\\s*(['"])${e}\\2`, 'g'),
      `$1: $t('${tKey}')`,
    );
    // default: () => '...'
    r = r.replace(
      new RegExp(`default:\\s*\\(\\)\\s*=>\\s*(['"])${e}\\1`, 'g'),
      `default: () => $t('${tKey}')`,
    );
    // return '...' in render
    r = r.replace(
      new RegExp(`return\\s+(['"])${e}\\1`, 'g'),
      `return $t('${tKey}')`,
    );
  }
  return r;
}

let n = 0;
for (const { abs, rel } of walkVueFiles(activityRoot)) {
  const orig = fs.readFileSync(abs, 'utf8');
  const next = ensureImport(apply(orig));
  if (next !== orig) {
    fs.writeFileSync(abs, next, 'utf8');
    n++;
    console.log('Updated', rel);
  }
}
console.log('Files updated:', n);
