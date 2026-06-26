/**
 * Pass 4: multiline labels, ternary titles, remaining ActivityFormModal strings.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '..');
const activityRoot = path.join(appRoot, 'src/views/activity');
const localesDir = path.join(appRoot, 'src/locales/langs');

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, p));
    else out[p] = v;
  }
  return out;
}

const zhFlat = flatten(JSON.parse(fs.readFileSync(path.join(localesDir, 'zh-CN/activity.json'), 'utf8')));
const zhToKey = {};
for (const [k, v] of Object.entries(zhFlat)) {
  if (typeof v === 'string' && /[\u4e00-\u9fff]/.test(v)) {
    const clean = v.replace(/^\*\s*/, '').trim();
    if (!zhToKey[clean]) zhToKey[clean] = `activity.${k}`;
    if (!zhToKey[v]) zhToKey[v] = `activity.${k}`;
  }
}

// Extra explicit mappings for form modal
const EXPLICIT = {
  '编辑活动': 'activity.formModal.k7f16',
  '新增活动': 'activity.activityList.k65b0',
  '* 活动分类': 'activity.formModal.k6d3b',
  '* 选择币种': 'activity.formModal.k9009',
  '* 活动名称': 'activity.rewardReport.k6d3b',
  '* 活动时间': 'activity.activityList.k6d3b3',
  '* 展示时间': 'activity.formModal.k5c55',
  '* 循环方式': 'activity.formModal.k5faa',
  '请选择': 'common.pleaseSelect',
  '样式': 'activity.formModal.k6837',
  '预览': 'activity.vipRewards',
};
for (const [zh, key] of Object.entries(EXPLICIT)) {
  zhToKey[zh] = key;
}

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

const sorted = Object.entries({ ...zhToKey, ...EXPLICIT }).sort((a, b) => b[0].length - a[0].length);

for (const { abs, rel } of walkVueFiles(activityRoot)) {
  let c = fs.readFileSync(abs, 'utf8');
  const orig = c;

  // Multiline label text: >* 活动分类</label
  c = c.replace(/>\s*(\*?\s*[\u4e00-\u9fff][^<\n]{0,80}?)\s*<\/label/g, (match, text) => {
    const t = text.trim();
    const key = zhToKey[t] || zhToKey[t.replace(/^\*\s*/, '')];
    if (key) return `>{{ $t('${key}') }}</label`;
    return match;
  });

  // Multiline span/h3/strong text
  c = c.replace(/>\s*(\*?\s*[\u4e00-\u9fff][^<\n]{0,80}?)\s*<\/(span|h3|strong|p|div)/g, (match, text, tag) => {
    const t = text.trim();
    if (t.includes('{{') || t.includes('$t')) return match;
    const key = zhToKey[t] || zhToKey[t.replace(/^\*\s*/, '')];
    if (key) return `>{{ $t('${key}') }}</${tag}`;
    return match;
  });

  // Ternary in attributes
  c = c.replace(
    /:title="isEditing \? '编辑活动' : '新增活动'"/g,
    ":title=\"isEditing ? $t('activity.formModal.k7f16') : $t('activity.activityList.k65b0')\"",
  );

  for (const [zh, key] of sorted) {
    if (!/[\u4e00-\u9fff]/.test(zh)) continue;
    const e = esc(zh);
    // placeholder with template literal partial - skip
    c = c.replace(new RegExp(`placeholder="${e}"`, 'g'), `:placeholder="$t('${key}')"`);
    c = c.replace(new RegExp(`placeholder='${e}'`, 'g'), `:placeholder="$t('${key}')"`);
    c = c.replace(new RegExp(`tab="${e}"`, 'g'), `:tab="$t('${key}')"`);
    // standalone in template {{ }}
    c = c.replace(new RegExp(`\\{\\{\\s*${e}\\s*\\}\\}`, 'g'), `{{ $t('${key}') }}`);
  }

  if (c !== orig) {
    fs.writeFileSync(abs, c, 'utf8');
    console.log('Pass4', rel);
  }
}
console.log('Pass 4 done');
