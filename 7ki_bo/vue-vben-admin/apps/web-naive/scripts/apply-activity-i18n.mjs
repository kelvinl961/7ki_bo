/**
 * Generate activity locale JSON files and apply $t() replacements to Vue files.
 * Run: node scripts/apply-activity-i18n.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, '..');
const activityRoot = path.join(appRoot, 'src/views/activity');
const localesDir = path.join(appRoot, 'src/locales/langs');

const CHINESE_RE = /[\u4e00-\u9fff]/;

/** Simple EN translations for common gaming/admin terms */
const EN_OVERRIDES = {
  活动中心: 'Activity Center',
  任务中心: 'Task Center',
  公积金: 'Provident Fund',
  幸运转盘: 'Lucky Wheel',
  优惠活动: 'Promotions',
  活动列表: 'Activity List',
  已关闭活动: 'Closed Activities',
  优惠统计: 'Promotion Statistics',
  分享管理: 'Share Management',
  新人福利: 'New Member Benefits',
  每日任务: 'Daily Tasks',
  每周任务: 'Weekly Tasks',
  三日神秘任务: 'Three-Day Mystery Task',
  活跃度设置: 'Activity Settings',
  派发奖励: 'Distribute Rewards',
  新增活动: 'Create Activity',
  编辑活动: 'Edit Activity',
  基础设置: 'Basic Settings',
  保存草稿: 'Save Draft',
  保存提交: 'Save & Submit',
  确定: 'Confirm',
  查看: 'View',
  编辑: 'Edit',
  记录: 'Records',
  开启: 'Enable',
  关闭: 'Disable',
  删除: 'Delete',
  搜索: 'Search',
  导出: 'Export',
  进行中: 'In Progress',
  已完成: 'Completed',
  草稿: 'Draft',
  已暂停: 'Paused',
  已归档: 'Archived',
  不限制: 'No Restriction',
  今日: 'Today',
  昨天: 'Yesterday',
  上周: 'Last Week',
  日: 'Day',
  周: 'Week',
  月: 'Month',
  全部状态: 'All Statuses',
  修改: 'Modify',
  详情: 'Details',
  展示: 'Show',
  不展示: 'Hide',
  系统: 'System',
  未设置: 'Not Set',
  未分类: 'Uncategorized',
  未知类型: 'Unknown Type',
  未知状态: 'Unknown Status',
  未知错误: 'Unknown Error',
  正常: 'OK',
  加载失败: 'Load failed',
  操作失败: 'Operation failed',
  导出失败: 'Export failed',
  敬请期待: 'Coming Soon',
};

/** Simple VI translations */
const VI_OVERRIDES = {
  活动中心: 'Trung tâm hoạt động',
  任务中心: 'Trung tâm nhiệm vụ',
  公积金: 'Quỹ tích lũy',
  幸运转盘: 'Vòng quay may mắn',
  优惠活动: 'Khuyến mãi',
  活动列表: 'Danh sách hoạt động',
  已关闭活动: 'Hoạt động đã đóng',
  优惠统计: 'Thống kê khuyến mãi',
  分享管理: 'Quản lý chia sẻ',
  新人福利: 'Phúc lợi thành viên mới',
  每日任务: 'Nhiệm vụ hàng ngày',
  每周任务: 'Nhiệm vụ hàng tuần',
  三日神秘任务: 'Nhiệm vụ bí ẩn 3 ngày',
  活跃度设置: 'Cài đặt hoạt động',
  派发奖励: 'Phát thưởng',
  新增活动: 'Tạo hoạt động',
  编辑活动: 'Chỉnh sửa hoạt động',
  基础设置: 'Cài đặt cơ bản',
  保存草稿: 'Lưu nháp',
  保存提交: 'Lưu & Gửi',
  确定: 'Xác nhận',
  查看: 'Xem',
  编辑: 'Chỉnh sửa',
  记录: 'Lịch sử',
  开启: 'Bật',
  关闭: 'Tắt',
  删除: 'Xóa',
  搜索: 'Tìm kiếm',
  导出: 'Xuất',
  进行中: 'Đang diễn ra',
  已完成: 'Hoàn thành',
  草稿: 'Bản nháp',
  不限制: 'Không giới hạn',
  今日: 'Hôm nay',
  昨天: 'Hôm nay',
  上周: 'Tuần trước',
  日: 'Ngày',
  周: 'Tuần',
  月: 'Tháng',
  全部状态: 'Tất cả trạng thái',
  修改: 'Sửa',
  详情: 'Chi tiết',
  展示: 'Hiển thị',
  不展示: 'Ẩn',
  系统: 'Hệ thống',
  未设置: 'Chưa đặt',
  敬请期待: 'Sắp ra mắt',
};

function toCamelKey(str) {
  return str
    .replace(/[^\u4e00-\u9fffa-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w, i) => {
      if (/^[\u4e00-\u9fff]/.test(w)) {
        return `k${w.codePointAt(0).toString(16)}`;
      }
      const s = w.replace(/[^a-zA-Z0-9]/g, '');
      if (!s) return '';
      return i === 0 ? s.charAt(0).toLowerCase() + s.slice(1) : s.charAt(0).toUpperCase() + s.slice(1);
    })
    .filter(Boolean)
    .join('')
    .slice(0, 60) || 'text';
}

function sectionFromFile(relPath) {
  const p = relPath.replace(/\\/g, '/');
  if (p === 'ActivityCenter.vue') return 'center';
  if (p === 'TaskCenter.vue') return 'taskCenter';
  if (p === 'ProvidentFund.vue') return 'providentFund';
  if (p === 'LuckyWheel.vue') return 'luckyWheel';
  if (p === 'ActivityRewardReport.vue') return 'rewardReport';
  if (p.includes('ActivityFormModal')) return 'formModal';
  if (p.includes('ActivityList')) return 'activityList';
  if (p.includes('ClosedActivityList')) return 'closedActivityList';
  if (p.includes('ActivityStatistics')) return 'statistics';
  if (p.includes('ActivityDetailModal')) return 'detailModal';
  if (p.includes('ActivityRecordModal')) return 'recordModal';
  if (p.includes('DistributeRewardModal')) return 'distributeReward';
  if (p.includes('ProvidentFundSettingModal')) return 'providentFundSetting';
  if (p.includes('LuckyWheelPublicConfigModal')) return 'luckyWheelPublicConfig';
  if (p.includes('LuckyWheelEditModal')) return 'luckyWheelEdit';
  if (p.includes('LuckyWheelAddLuckyValueModal')) return 'luckyWheelAddLuckyValue';
  if (p.includes('ShareManagement')) return 'shareManagement';
  if (p.includes('NoviceWelfareManager')) return 'noviceWelfare';
  if (p.includes('NoviceWelfareSettingsModal')) return 'noviceWelfareSettings';
  if (p.includes('NoviceWelfareGlobalModal')) return 'noviceWelfareGlobal';
  if (p.includes('TaskFormModal')) return 'taskForm';
  if (p.includes('TaskDetailModal')) return 'taskDetail';
  if (p.includes('DailyTaskManager')) return 'dailyTask';
  if (p.includes('WeeklyTaskManager')) return 'weeklyTask';
  if (p.includes('ThreeDayMysteryManager')) return 'threeDayMystery';
  if (p.includes('ActivitySettingManager')) return 'activitySetting';
  return 'common';
}

function extractStrings(content) {
  const found = new Set();
  const patterns = [
    /(?:label|placeholder|title|tab|description|content|positive-text|negative-text)=["']([^"']*[\u4e00-\u9fff][^"']*)["']/g,
    />([^<{}]*[\u4e00-\u9fff][^<{}]*)</g,
    /(?:message\.(?:success|error|warning|info)|dialog\.warning)\([^)]*["']([^"']*[\u4e00-\u9fff][^"']*)["']/g,
    /(?:default|title|text|label):\s*(?:\(\)\s*=>\s*)?["'`]([^"'`]*[\u4e00-\u9fff][^"'`]*)["'`]/g,
    /["']([^"']*[\u4e00-\u9fff][^"']*)["']/g,
  ];
  for (const re of patterns) {
    let m;
    const r = new RegExp(re.source, re.flags);
    while ((m = r.exec(content))) {
      let s = m[1].trim();
      if (!s || !CHINESE_RE.test(s)) continue;
      if (s.includes('//') || s.includes('/*') || s.includes('*/')) continue;
      if (s.includes('</') || s.includes('${') || s.includes('=>')) continue;
      if (/^[\s\*\/]/.test(s)) continue;
      if (s.length > 200) continue;
      found.add(s);
    }
  }
  return [...found];
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

function setNested(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = cur[parts[i]] || {};
    cur = cur[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (cur[last] && cur[last] !== value) {
    let n = 2;
    while (cur[`${last}${n}`]) n++;
    cur[`${last}${n}`] = value;
  } else {
    cur[last] = value;
  }
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

function unflatten(flat) {
  const obj = {};
  for (const [k, v] of Object.entries(flat)) setNested(obj, k, v);
  return obj;
}

function translateEn(zh) {
  if (EN_OVERRIDES[zh]) return EN_OVERRIDES[zh];
  return zh
    .replace(/共\s*\{0\}\s*条/g, '{0} records total')
    .replace(/已选择\s*\{0\}\s*条/g, 'Selected {0}')
    .replace(/请输入/g, 'Please enter ')
    .replace(/请选择/g, 'Please select ')
    .replace(/会员/g, 'Member ')
    .replace(/活动/g, 'Activity ')
    .replace(/奖励/g, 'Reward ')
    .replace(/失败/g, ' failed')
    .replace(/成功/g, ' successful');
}

function translateVi(zh) {
  if (VI_OVERRIDES[zh]) return VI_OVERRIDES[zh];
  return translateEn(zh);
}

// Build translation map
const zhToKey = {};
const vueFiles = walkVueFiles(activityRoot);

for (const { abs, rel } of vueFiles) {
  const content = fs.readFileSync(abs, 'utf8');
  const section = sectionFromFile(rel);
  const strings = extractStrings(content);
  const usedKeys = new Set();
  for (const zh of strings) {
    if (zhToKey[zh]) continue;
    let baseKey = toCamelKey(zh.replace(/^\*?\s*/, '').replace(/[:：]\s*$/, ''));
    let key = `${section}.${baseKey}`;
    let n = 2;
    while (usedKeys.has(key) || Object.values(zhToKey).includes(key)) {
      key = `${section}.${baseKey}${n}`;
      n++;
    }
    usedKeys.add(key);
    zhToKey[zh] = key;
  }
}

// Add shared top-level keys
setNested(zhToKey, 'totalRecords', 'activity.totalRecords');
const zhFlat = {};
const enFlat = {};
const viFlat = {};

zhFlat.totalRecords = '共 {0} 条';
enFlat.totalRecords = '{0} records total';
viFlat.totalRecords = 'Tổng {0} bản ghi';

for (const [zh, key] of Object.entries(zhToKey)) {
  if (typeof key !== 'string' || key === 'activity.totalRecords') continue;
  const shortKey = key.startsWith('activity.') ? key.slice('activity.'.length) : key;
  zhFlat[shortKey] = zh;
  enFlat[shortKey] = translateEn(zh);
  viFlat[shortKey] = translateVi(zh);
}

const zhJson = unflatten(zhFlat);
const enJson = unflatten(enFlat);
const viJson = unflatten(viFlat);

for (const [lang, data] of [
  ['zh-CN', zhJson],
  ['en-US', enJson],
  ['vi-VN', viJson],
]) {
  const outPath = path.join(localesDir, lang, 'activity.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${outPath} (${Object.keys(flatten(data)).length} keys)`);
}

// Save reverse map
const mapPath = path.join(__dirname, 'activity-i18n-map.json');
fs.writeFileSync(
  mapPath,
  JSON.stringify(
    Object.fromEntries(
      Object.entries(zhToKey)
        .filter(([, k]) => typeof k === 'string')
        .map(([zh, key]) => [zh, `activity.${key.startsWith('activity.') ? key.slice(9) : key}`]),
    ),
    null,
    2,
  ),
  'utf8',
);

// Apply replacements (longest first)
const replacements = Object.entries(
  JSON.parse(fs.readFileSync(mapPath, 'utf8')),
).sort((a, b) => b[0].length - a[0].length);

function ensureImport(content) {
  if (content.includes("from '@vben/locales'")) return content;
  const scriptMatch = content.match(/<script setup[^>]*>/);
  if (!scriptMatch) return content;
  const insert = `${scriptMatch[0]}\nimport { $t } from '@vben/locales';\n`;
  return content.replace(scriptMatch[0], insert);
}

function applyReplacements(content) {
  let result = content;
  for (const [zh, tKey] of replacements) {
    if (!CHINESE_RE.test(zh)) continue;
    const escaped = zh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Skip if already translated
    if (result.includes(`$t('${tKey}')`)) continue;

    // Attribute patterns
    for (const attr of ['label', 'placeholder', 'title', 'tab', 'description', 'content', 'positive-text', 'negative-text']) {
      result = result.replace(
        new RegExp(`${attr}="${escaped}"`, 'g'),
        `:${attr}="$t('${tKey}')"`,
      );
      result = result.replace(
        new RegExp(`${attr}='${escaped}'`, 'g'),
        `:${attr}="$t('${tKey}')"`,
      );
    }

    // Template literal title
    result = result.replace(
      new RegExp(`:title="\`${escaped.replace(/\{/g, '\\{').replace(/\}/g, '\\}')}`, 'g'),
      () => null,
    );

    // Text between tags (simple)
    result = result.replace(
      new RegExp(`>\\s*${escaped}\\s*<`, 'g'),
      `>{{ $t('${tKey}') }}<`,
    );

    // Script strings - careful with quotes
    result = result.replace(
      new RegExp(`'${escaped}'`, 'g'),
      `$t('${tKey}')`,
    );
    result = result.replace(
      new RegExp(`"${escaped}"`, 'g'),
      `$t('${tKey}')`,
    );

    // label: 'xxx' in objects
    result = result.replace(
      new RegExp(`(label|text|title):\\s*'${escaped}'`, 'g'),
      `$1: $t('${tKey}')`,
    );
    result = result.replace(
      new RegExp(`(label|text|title):\\s*"${escaped}"`, 'g'),
      `$1: $t('${tKey}')`,
    );

    // default: () => 'xxx'
    result = result.replace(
      new RegExp(`default:\\s*\\(\\)\\s*=>\\s*'${escaped}'`, 'g'),
      `default: () => $t('${tKey}')`,
    );
    result = result.replace(
      new RegExp(`default:\\s*\\(\\)\\s*=>\\s*"${escaped}"`, 'g'),
      `default: () => $t('${tKey}')`,
    );
  }
  return result;
}

let changed = 0;
for (const { abs, rel } of vueFiles) {
  let content = fs.readFileSync(abs, 'utf8');
  const updated = ensureImport(applyReplacements(content));
  if (updated !== content) {
    fs.writeFileSync(abs, updated, 'utf8');
    changed++;
    console.log('Updated', rel);
  }
}
console.log(`Done. Updated ${changed} files.`);
