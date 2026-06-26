/**
 * Pass 4 (safe): multiline label text and remaining ternary titles.
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
    zhToKey[v.trim()] = `activity.${k}`;
    zhToKey[v.trim().replace(/^\*\s*/, '')] = `activity.${k}`;
  }
}

function keyFor(text) {
  const t = text.trim();
  return zhToKey[t] || zhToKey[t.replace(/^\*\s*/, '')];
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

for (const { abs, rel } of walkVueFiles(activityRoot)) {
  let c = fs.readFileSync(abs, 'utf8');
  const orig = c;

  c = c.replace(
    /:title="isEditing \? '编辑活动' : '新增活动'"/g,
    ":title=\"isEditing ? $t('activity.formModal.k7f16') : $t('activity.activityList.k65b0')\"",
  );

  // Text line inside open tag block before child element (label/h3/span etc.)
  c = c.replace(
    /\n(\s+)(\*?[\u4e00-\u9fff][^\n<]{0,60})\n(\s+<(?:n-icon|n-radio|n-checkbox|n-switch|n-button|n-input|n-select|HelpCircle|Add|Close))/g,
    (m, indent, text, child) => {
      const k = keyFor(text);
      if (!k) return m;
      return `\n${indent}{{ $t('${k}') }}\n${child}`;
    },
  );

  // >* label text</label on one line broken across lines: >\n  * xxx\n</label
  c = c.replace(/>\s*\n\s*(\*?[\u4e00-\u9fff][^\n<]{0,60})\s*\n\s*<\/label/g, (m, text) => {
    const k = keyFor(text);
    if (!k) return m;
    return `>{{ $t('${k}') }}</label`;
  });

  // ActivityDetailModal inline ternaries
  const detailPatches = [
    [/\{\{ mappedActivity\.currencyScope \|\| '未设置' \}\}/g, "{{ mappedActivity.currencyScope || $t('activity.statuses.notSet') }}"],
    [/\{\{ mappedActivity\.maxParticipants \|\| '无限制' \}\}/g, "{{ mappedActivity.maxParticipants || $t('activity.common.unlimited') }}"],
    [/\{\{ mappedActivity\.isActive \? '展示中' : '已隐藏' \}\}/g, "{{ mappedActivity.isActive ? $t('activity.detailModal.k5c55') : $t('activity.detailModal.k5df2') }}"],
    [/mappedActivity\.isCurrentlyActive \? '进行中' : '未开始\/已结束'/g, "mappedActivity.isCurrentlyActive ? $t('activity.statuses.active') : $t('activity.detailModal.k672a')"],
    [/mappedActivity\.maxParticipants \|\| '无限制'/g, "mappedActivity.maxParticipants || $t('activity.common.unlimited')"],
    [/'未设置标题'/g, "$t('activity.detailModal.k672a2')"],
    [/'系统'/g, "$t('activity.statuses.system')"],
    [/DRAFT: '草稿'/g, "DRAFT: $t('activity.statuses.draft')"],
    [/ACTIVE: '进行中'/g, "ACTIVE: $t('activity.statuses.active')"],
    [/CLOSED: '已关闭'/g, "CLOSED: $t('activity.activityList.k5173')"],
    [/ENDED: '已结束'/g, "ENDED: $t('activity.detailModal.k5df2')"],
    [/draft: '草稿'/g, "draft: $t('activity.statuses.draft')"],
    [/active: '进行中'/g, "active: $t('activity.statuses.active')"],
    [/paused: '已暂停'/g, "paused: $t('activity.statuses.paused')"],
    [/archived: '已归档'/g, "archived: $t('activity.statuses.archived')"],
    [/return `\$\{diffDays\}天`/g, "return $t('activity.detailModal.k65e5', [diffDays])"],
    [/return `\$\{Math\.floor\(diffDays \/ 30\)\}个月`/g, "return $t('activity.detailModal.k6708', [Math.floor(diffDays / 30)])"],
    [/return `\$\{Math\.floor\(diffDays \/ 365\)\}年`/g, "return $t('activity.detailModal.k5e74', [Math.floor(diffDays / 365)])"],
    [/return `\$\{days\}天\$\{hours\}小时`/g, "return $t('activity.detailModal.k65e5h', [days, hours])"],
    [/return `\$\{hours\}小时\$\{minutes\}分钟`/g, "return $t('activity.detailModal.k5c0fh', [hours, minutes])"],
    [/return `\$\{minutes\}分钟`/g, "return $t('activity.detailModal.k5206f', [minutes])"],
  ];
  for (const [re, rep] of detailPatches) c = c.replace(re, rep);

  if (c !== orig) {
    fs.writeFileSync(abs, c, 'utf8');
    console.log('Pass4safe', rel);
  }
}
console.log('Done');
